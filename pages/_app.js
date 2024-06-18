import { LoadScript } from '@react-google-maps/api';
import '../styles/globals.css'

const libraries = process.env.GOOGLE_MAPS_LIBRARIES;

function MyApp({ Component, pageProps }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <Component {...pageProps} />
    </LoadScript>
  );
}

export default MyApp
