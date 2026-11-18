import { useState } from "react";
import { PropTypes } from "prop-types";
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
      <div
        className={`flex items-center justify-center bg-base-200 text-primary ${
          className || ""
        }`}
        role="img"
        aria-label={alt}
      >
        <FaBookOpen className={iconClassName || "w-10 h-10 opacity-60"} />
      </div>
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
