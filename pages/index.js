import { useState, useMemo, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

import locationsData from "./api/places.json";

export default function Places() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) return <div className="loading">Cargando...</div>;
  return <Map />;
}

function Map() {
  const center = useMemo(() => ({ lat: 40.57296655064263, lng: -4.1542498840674185 }), []);
  const [selected, setSelected] = useState(null);
  const [showAllMarkers, setShowAllMarkers] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);

  const handleToggleMarkers = () => {
    setShowAllMarkers(!showAllMarkers);
    setSelected(null);
  };


  const handleMarkerClick = (marker) => {
    setActiveMarker(marker);
  };

  return (
    <>
      <div className="places-container">
        <PlacesAutocomplete setSelected={setSelected} setShowAllMarkers={setShowAllMarkers} />
        <button onClick={handleToggleMarkers}>
          {showAllMarkers ? "Ocultar todo" : "Mostrar todo"}
        </button>
      </div>


      <GoogleMap
        zoom={17}
        center={center}
        mapContainerClassName="map-container"
      >
        {showAllMarkers &&
          locationsData.kml.Document.Placemark.map((place, index) => {
            const [lng, lat] = place.Point.coordinates.split(",").map(Number);
            const isBusStop = place.name.toLowerCase().includes("parada bus");
            return (
              <Marker
                key={index}
                position={{ lat, lng }}
                icon={isBusStop ? "http://maps.google.com/mapfiles/ms/icons/bus.png" : undefined}
                onClick={() => handleMarkerClick({ name: place.name, position: { lat, lng } })}
              />
            );
          })
        }

        {selected && (
          <Marker
            position={selected}
            icon={selected.name.toLowerCase().includes("parada bus") ? "http://maps.google.com/mapfiles/ms/icons/bus.png" : undefined}
            onClick={() => handleMarkerClick({ name: selected.name, position: selected })}
          />
        )}

        {activeMarker && (
          <InfoWindow
            position={activeMarker.position}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div>
              <h3>{activeMarker.name}</h3>
              <p>Lat: {activeMarker.position.lat}</p>
              <p>Lng: {activeMarker.position.lng}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  );
}

const PlacesAutocomplete = ({ setSelected, setShowAllMarkers }) => {
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filteredSuggestions = locationsData.kml.Document.Placemark.filter((placemark) =>
      placemark.name.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filteredSuggestions);
  }, [value]);

  const handleSelect = (address) => {
    setValue(address, false);
    const selectedPlace = suggestions.find((place) => place.name === address);
    if (selectedPlace) {
      const [lng, lat] = selectedPlace.Point.coordinates.split(",").map(Number);
      setSelected({ name: selectedPlace.name, lat, lng });
      setShowAllMarkers(false);
    }
    setSuggestions([]);
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setShowAllMarkers(false);
        }}
        disabled={!ready}
        className="combobox-input"
        placeholder="Busca una peña..."
      />
      <ComboboxPopover>
        <ComboboxList className="combobox-list">
          {suggestions.map((suggestion) => (
            <ComboboxOption
              key={suggestion.name}
              value={suggestion.name}
              className="combobox-list-item"
            />
          ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
};
