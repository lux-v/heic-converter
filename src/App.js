import { useState, useEffect } from 'react';
import HeicConverter from './HeicConverter/HeicConverter';
import './App.css';

import bg1 from './assets/images/bg1.jfif';


let intervalId = null;

function App() {
  const [imageUrl, setImageUrl] = useState(bg1);

  const fetchBackgroundImage = () => {

    intervalId = setInterval(() => {
      fetch('https://random.imagecdn.app/3840/2160')
        .then(data => {

          const newImageUrl = data.url;
          const img = new Image();
          img.src = newImageUrl;
          img.onload = () => {
            setImageUrl(newImageUrl);
          };
        })
        .catch(error => {
          console.error(error)
          setImageUrl(bg1);
        });
    }, 10000);
  }



  useEffect(() => {
    fetchBackgroundImage();
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="container"
      style={{
        backgroundImage: `url(${imageUrl})`, backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 1s ease-in-out"
      }}
    >
      <HeicConverter />
    </div>
  );
}

export default App;