import { useState } from "react";
import { PropTypes } from "prop-types";
import Box from "@mui/material/Box";
import { FaBookOpen } from "react-icons/fa";

/**
 * Image with a graceful fallback. When the source is missing or fails to
 * load (e.g. a dead cover URL), a placeholder is rendered instead of the
 * browser's broken-image icon, keeping the surrounding layout intact.
 */
const SafeImage = ({ src, alt, className, iconClassName }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Box
        className={`flex items-center justify-center ${className || ""}`}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "grey.800" : "grey.200",
          color: "primary.main",
        }}
        role="img"
        aria-label={alt}
      >
        <FaBookOpen className={iconClassName || "w-10 h-10 opacity-60"} />
      </Box>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

SafeImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
};

export default SafeImage;
