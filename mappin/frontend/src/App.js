import * as React from "react";
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

import GeocoderControl from "./GeocoderControl";
import MarkerPin from "./MarkerPin"; //검색결과 표시 마커
import Pin from "./pin"; //RoomIcon 사용자 설정마커

// import moment from "moment"; //몇시간전인지 알려주는 패키지
// // 안써도 자동으로 한국 시간을 불러온다. 명확하게 하기 위해 import
// import "moment/locale/ko";

import "./app.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import axios from "axios";
import StarIcon from "@mui/icons-material/Star";
import RoomIcon from "@mui/icons-material/Room";

//const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX; // Set your mapbox token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibW9tcGEiLCJhIjoiY2w5eWc5ZmZjMDRsOTNudDkwcHhyZXNjcSJ9.B22i7Iuuh6amVu9CW7ffpQ";

function App(prop) {
  //검색한 위치에 마커 표시
  const [markerPin, setMarkerPin] = useState({
    latitude: prop?.initialGeographicPoint?.latitude,
    longitude: prop?.initialGeographicPoint?.longitude
  });
  console.log(markerPin);

  //db에서 가져온 마커들
  const [marker, setMarkers] = useState([]);

  //서버에서 가져오기
  useEffect(() => {
    const getMarkers = async () => {
      try {
        const allPins = await axios.get(`/pins`);
        console.log("====useEffect");
        console.log(allPins);

        setMarkers(allPins.data);
        console.log();
      } catch (err) {
        console.log(err);
      }
    };
    getMarkers();
  }, []); //처음 실행할때 수행
  //두번째 파라미터를 사용하는 경우 useEffect는 componentDidMount + componentDidUpdate역할을 동시

  const [popupInfo, setPopupInfo] = useState(null);

  //useMemo 실행여부 확인해야함
  // const pins = useMemo(
  // () =>
  //  marker.map(p => (
  //     <Marker
  //       key={`marker-${p._id}`}
  //       longitude={p.long}
  //       latitude={p.lat}
  //       anchor="bottom"
  //       onClick={e => {
  //         e.originalEvent.stopPropagation();
  //         setPopupInfo(p);
  //       }}>
  //       <Pin />
  //     </Marker>
  //   )),
  //   []
  // )
  // );

  function onDragEnd(e) {
    const viewState = e.viewState;
    if (viewState) {
      setMarkerPin({
        latitude: viewState.latitude,
        longitude: viewState.longitude
      });
    }
  }

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

  const currentUsername = "Hoy";
  return (
    <>
      <Map
        initialViewState={{
          latitude: 47.040182,
          longitude: 17.071727,
          // latitude: markerPin.latitude,
          // longitude: markerPin.longitude,
          zoom: 5,
          bearing: 0,
          pitch: 0
        }}
        mapStyle="mapbox://styles/mompa/cl9zhwav5000c14ujqbrv23ev"
        //mapStyle="mapbox://styles/mapbox/streets-v9"
        //mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        // style={{ height: 600, width: 600 }}
        attributionControl={false}
        //onDragEnd={onDragEnd} //지도 움직일때마다 마커핀 이동
        onLoad={onLoadMap}>
        {markerPin.latitude && (
          <Marker latitude={markerPin.latitude} longitude={markerPin.longitude}>
            <MarkerPin />
          </Marker>
        )}

        <GeocoderControl setMarkerPin={setMarkerPin} position="top-left" />

        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />
        <ScaleControl />

        {/* {pins} */}
        {/* 사용자가 설정한 핀 설정 */}
        {marker.map(p => (
          <Marker
            key={p._id}
            longitude={p.long}
            latitude={p.lat}
            anchor="bottom"
            onClick={e => {
              // If we let the click event propagates to the map, it will immediately close the popup
              // with `closeOnClick: true`
              e.originalEvent.stopPropagation();
              //팝업에 표시될 내용 설정
              setPopupInfo(p);
              console.log("==Marker onClick() => setPopupInfo");
              console.log(p);
            }}>
            {/* <Pin /> */}

            <RoomIcon
              style={{
                fontSize: 20,
                color: currentUsername === p.username ? "tomato" : "slateblue",
                cursor: "pointer"
              }}
            />
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            key={popupInfo._id}
            anchor="top"
            longitude={Number(popupInfo.long)}
            latitude={Number(popupInfo.lat)}
            onClose={() => setPopupInfo(null)}>
            <div className="card">
              <label>Place</label>
              <h4 className="place">{popupInfo.title}</h4>
              <label>Review</label>
              <p className="desc">{popupInfo.desc}</p>
              <label>Rating</label>
              <div className="stars">
                {Array(popupInfo.rating).fill(<StarIcon className="star" />)}
              </div>
              <label>Information</label>
              <span className="username">
                Created by <b>{popupInfo.username}</b>
              </span>
              {/* <span className="date">{moment().format(popupInfo.createdAt)}</span> */}

              {/* <span className="date">{format(popupInfo.createdAt)}</span> */}
            </div>
            {/* <img width="100%" src={popupInfo.image} /> */}
          </Popup>
        )}
      </Map>
    </>
  );
}
export default App;
