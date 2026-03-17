import React from "react";
import { Fab, Box } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

interface Props {
  mapRef: React.RefObject<HTMLDivElement>;
  handleGoToMyLocation: () => void;
}

const MapView: React.FC<Props> = ({ mapRef, handleGoToMyLocation }) => {
  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Box ref={mapRef} sx={{ width: "100%", height: "100%" }} />
      <Fab
        color="primary"
        aria-label="go to my location"
        sx={{ position: "absolute", bottom: 24, right: 24 }}
        onClick={handleGoToMyLocation}
      >
        <MyLocationIcon />
      </Fab>
    </Box>
  );
};

export default MapView;
