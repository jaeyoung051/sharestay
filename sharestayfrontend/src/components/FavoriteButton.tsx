// src/components/FavoriteButton.tsx
import { useState, useEffect } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

type FavoriteButtonProps = {
  roomId: number;
  isLiked: boolean;
  loading?: boolean;
  onToggle?: (newValue: boolean) => Promise<void> | void;
};

export default function FavoriteButton({
  isLiked: initialLiked,
  loading: loadingProp,
  onToggle,
}: FavoriteButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  // 🔥 props 로 isLiked 가 바뀌면 버튼도 갱신
  useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);

  const isBusy = loadingProp ?? loading;

  const handleClick = async () => {
    if (isBusy || !onToggle) return;

    const newState = !isLiked;

    // 내부 상태는 즉시 반영해서 피드백 주기
    setIsLiked(newState);
    setLoading(true);

    try {
      await onToggle(newState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      onClick={handleClick}
      disabled={isBusy}
      sx={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: "1px solid rgba(0,0,0,0.15)",
        color: isLiked ? "red" : "rgba(0,0,0,0.4)",
        backgroundColor: "white",
      }}
    >
      {isBusy ? (
        <CircularProgress size={20} />
      ) : isLiked ? (
        <FavoriteIcon color="error" />
      ) : (
        <FavoriteBorderIcon />
      )}
    </IconButton>
  );
}
