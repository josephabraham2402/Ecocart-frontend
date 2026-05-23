import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ onAddressFound }) {
    const [position, setPosition] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            fetchAddress(e.latlng);
        },
    });

    const fetchAddress = async (latlng) => {
        setLoading(true);
        const toastId = toast.loading('Fetching address...');
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            if (!response.ok) {
                throw new Error('Failed to fetch address details.');
            }
            const data = await response.json();
            
            const address = data.address || {};
            const fullAddress = {
                lat: latlng.lat,
                lng: latlng.lng,
                street: address.road || '',
                city: address.city || address.town || address.village || '',
                state: address.state || '',
                postalCode: address.postcode || '',
                country: address.country || '',
            };
            onAddressFound(fullAddress);
            toast.success('Address found!', { id: toastId });
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function MapPicker({ onLocationSelect, initialPosition }) {
    // The MapContainer's center is set only on initial render.
    // To properly update it when editing, we use a key prop to force a re-render.
    const mapKey = initialPosition ? `${initialPosition.lat}-${initialPosition.lng}` : 'new';

    return (
        <div className="h-64 w-full relative" style={{ cursor: 'pointer' }}>
            <MapContainer key={mapKey} center={initialPosition || [20.5937, 78.9629]} zoom={initialPosition ? 13 : 5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onAddressFound={onLocationSelect} />
                {initialPosition && <Marker position={initialPosition}></Marker>}
            </MapContainer>
        </div>
    );
}