// src/components/Room/FilterModal.tsx
import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Stack,
  Select,
  MenuItem,
  Slider,
  Chip,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const roomTypeOptions = [
  { value: "", label: "전체" },
  { value: "ONE_ROOM", label: "원룸" },
  { value: "TWO_ROOM", label: "투룸" },
  { value: "OFFICETEL", label: "오피스텔" },
  { value: "APARTMENT", label: "아파트" },
];

const filterFacilities = [
  "에어컨",
  "냉장고",
  "세탁기",
  "인터넷",
  "주차장",
  "헬스장",
  "반려동물 가능",
  "발코니",
];

const formatPriceLabel = (value: number) => {
  if (value >= 2000000) return "200만+";
  if (value === 0) return "0원";
  return `${value / 10000}만`;
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  roomType: string;
  onRoomTypeChange: (e: SelectChangeEvent) => void;
  priceRange: number[];
  onPriceChange: (event: Event, newValue: number | number[]) => void;
  facilities: Set<string>;
  onToggleFacility: (facility: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  onApply,
  onReset,
  roomType,
  onRoomTypeChange,
  priceRange,
  onPriceChange,
  facilities,
  onToggleFacility,
}) => (
  <Modal open={open} onClose={onClose} aria-labelledby="filter-modal-title">
    <Box sx={modalStyle}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography id="filter-modal-title" variant="h6" component="h2">
          필터
        </Typography>
        <IconButton onClick={onClose} sx={{ p: 0.5 }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            방 종류
          </Typography>
          <Select
            value={roomType}
            onChange={onRoomTypeChange}
            fullWidth
            size="small"
            displayEmpty
          >
            {roomTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            가격 범위
          </Typography>
          <Slider
            value={priceRange}
            onChange={onPriceChange}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPriceLabel}
            min={0}
            max={5000000}
            step={10000}
          />
          <Typography variant="caption" color="text.secondary">
            {formatPriceLabel(priceRange[0])} ~{" "}
            {formatPriceLabel(priceRange[1])}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            편의시설
          </Typography>
          <Stack spacing={1} flexWrap="wrap" direction="row" useFlexGap>
            {filterFacilities.map((facility) => (
              <Chip
                key={facility}
                label={facility}
                variant={facilities.has(facility) ? "filled" : "outlined"}
                color={facilities.has(facility) ? "primary" : "default"}
                onClick={() => onToggleFacility(facility)}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
        </Stack>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
            mt: 2,
          }}
        >
          <Button variant="outlined" onClick={onReset} fullWidth>
            초기화
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onApply}
            fullWidth
          >
            적용
          </Button>
        </Box>
      </Stack>
    </Box>
  </Modal>
);

export default FilterModal;
