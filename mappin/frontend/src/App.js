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
import PhishingIcon from "@mui/icons-material/Phishing";
import FavoriteIcon from "@mui/icons-material/Favorite";

import Login from "./components/Login";
import Register from "./components/Register";

//const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX; // Set your mapbox token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibW9tcGEiLCJhIjoiY2w5eWc5ZmZjMDRsOTNudDkwcHhyZXNjcSJ9.B22i7Iuuh6amVu9CW7ffpQ";

function App(prop) {
  const myStorage = window.localStorage;
  const [currentUsername, setCurrentUsername] = useState(myStorage.getItem("user"));

  const [popupInfo, setPopupInfo] = useState(null);
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  //const [showPopup, setShowPopup] = useState(true);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [star, setStar] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  //검색한 위치에 마커 표시
  const [markerPin, setMarkerPin] = useState({
    latitude: prop?.initialGeographicPoint?.latitude,
    longitude: prop?.initialGeographicPoint?.longitude
  });

  //서버에서 가져오기
  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get(`/pins`); //마커할 장소 모두 가져오기
        console.log("====useEffect");
        console.log(allPins);

        setPins(allPins.data);
        console.log();
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []); //처음 실행할때 수행
  //두번째 파라미터를 사용하는 경우 useEffect는 componentDidMount + componentDidUpdate역할을 동시

  //useEffect에서 마커 정보 가져온후 pins가 변경되면 Marker Render
  const markerPins = useMemo(
    () =>
      pins.map(p => (
        <Marker
          key={p._id}
          longitude={p.lng}
          latitude={p.lat}
          anchor="bottom"
          // offsetLeft={-3.5 * p.zoom}
          // offsetTop={-7 * p.zoom}
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            //팝업에 표시될 내용 설정
            setPopupInfo(p);
            console.log("==Marker onClick() => setPopupInfo");
            console.log(p);
          }}>
          <RoomIcon
            style={{
              fontSize: 20,
              color: currentUsername === p.username ? "tomato" : "slateblue",
              cursor: "pointer"
            }}
          />
        </Marker>
      )),
    [pins] //pins 이 바뀌면 함수 실행
  );

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

  const handleAddClick = e => {
    //const [longitude, latitude] = e.lngLat;
    setNewPlace({
      lng: e.lngLat.lng,
      lat: e.lngLat.lat
    });
    console.log(e);
    console.log(newPlace);
  };

  const handleSubmit = async e => {
    console.log("handleSubmit");
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      lng: newPlace.lng
    };
    try {
      console.log(newPin);
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    setCurrentUsername(null);
    myStorage.removeItem("user");
  };

  return (
    <>
      <Map
        initialViewState={{
          longitude: 126.751521, //운정행복센터
          latitude: 37.723995,
          // latitude: markerPin.latitude,
          // longitude: markerPin.longitude,
          zoom: 9,
          bearing: 0,
          pitch: 0
        }}
        mapStyle="mapbox://styles/mompa/cl9zhwav5000c14ujqbrv23ev"
        //mapStyle="mapbox://styles/mapbox/streets-v9"
        //mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        // style={{ height: 600, width: 600 }}
        attributionControl={false}
        onDragEnd={onDragEnd} //지도 움직일때마다 마커핀 이동
        onLoad={onLoadMap}
        onDblClick={handleAddClick}>
        //검색한 장소를 표시해주는 마커
        {markerPins.latitude && (
          <Marker latitude={markerPin.latitude} longitude={markerPin.longitude}>
            <MarkerPin />
          </Marker>
        )}
        <GeocoderControl setMarkerPin={setMarkerPin} position="top-left" />
        <ScaleControl />
        <NavigationControl position="bottom-left" />
        <FullscreenControl position="bottom-left" />
        {markerPins}
        {popupInfo && (
          <Popup
            key={popupInfo._id}
            anchor="top"
            longitude={Number(popupInfo.lng)}
            latitude={Number(popupInfo.lat)}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}>
            <div className="card">
              <label>Place</label>
              <h4 className="place">{popupInfo.title}</h4>
              <label>Review</label>
              <p className="desc">{popupInfo.desc}</p>
              <label>Rating</label>
              <div className="stars">
                {Array(popupInfo.rating).fill(<FavoriteIcon className="star" />)}
              </div>
              <label>Information</label>
              <span className="username">
                Created by <b>{popupInfo.username}</b>
              </span>

              <span className="date">{popupInfo.createdAt}</span>
            </div>
            {/* <img width="100%" src={""} /> */}
          </Popup>
        )}
        {/* //New Place */}
        {newPlace && (
          <>
            <Popup
              longitude={Number(newPlace.lng)}
              latitude={Number(newPlace.lat)}
              closeOnClick={false}
              onClose={() => setNewPlace(null)}
              maxWidth={340}
              anchor="bottom">
              <div>
                <form onSubmit={handleSubmit}>
                  <label>Title</label>
                  <input
                    placeholder="Enter a title"
                    autoFocus
                    onChange={e => setTitle(e.target.value)}
                  />
                  <label>Description</label>
                  <textarea
                    placeholder="Say us something about this place."
                    onChange={e => setDesc(e.target.value)}
                  />
                  <label>Rating</label>
                  <select onChange={e => setStar(e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <button type="submit" className="submitButton">
                    Add Pin
                  </button>
                </form>
              </div>
            </Popup>
          </>
        )}
        {currentUsername ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
            <button className="button register" onClick={() => setShowRegister(true)}>
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            setCurrentUsername={setCurrentUsername}
            myStorage={myStorage}
          />
        )}
      </Map>
    </>
  );
}
export default App;
