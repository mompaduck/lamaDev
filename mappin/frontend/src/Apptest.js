import React from "react";
import { useState, useMemo, useEffect } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl
} from "react-map-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import MarkerPin from "./MarkerPin"; //검색결과 표시 마커

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX; // Set your mapbox token here

export default function App(prop) {
  //검색한 위치에 마커 표시
  const [markerPin, setMarkerPin] = useState({
    latitude: prop?.initialGeographicPoint?.latitude,
    longitude: prop?.initialGeographicPoint?.longitude
  });
  console.log(markerPin);

  function onLoadMap(e) {
    const map = e?.target;
    if (map) {
      const language = new MapboxLanguage({
        defaultLanguage: "ko"
      });
      map.addControl(language);
      language._initialStyleUpdate();
    }
  }

  return (
    <>
      <Map
        initialViewState={{
          latitude: 47.040182,
          longitude: 17.071727,
          // latitude: markerPin.latitude,
          // longitude: markerPin.longitude,
          zoom: 7,
          bearing: 0,
          pitch: 0
        }}
        //mapStyle="mapbox://styles/mompa/cl9zhwav5000c14ujqbrv23ev"
        //mapStyle="mapbox://styles/mapbox/streets-v9"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        // style={{ height: 600, width: 600 }}
        attributionControl={false}
        // onDragEnd={onDragEnd}  //지도 움직일때마다 마커핀 이동
        onLoad={onLoadMap}>
        {markerPin.latitude && (
          <Marker latitude={markerPin.latitude} longitude={markerPin.longitude}>
            <MarkerPin />
          </Marker>
        )}
      </Map>
    </>
  );
}
