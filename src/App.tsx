import { useEffect, useRef } from "react";
import "./App.css";

function getCloudinaryImageUrl(id: string) {
  const original = `https://res.cloudinary.com/chimson/image/upload/v1643655382/intersection-observer-demo/image_${id}.jpg`;
  const placeholder = `https://res.cloudinary.com/chimson/image/upload/f_webp,e_blur:1000,q_1/v1643655382/intersection-observer-demo/image_${id}.jpg`;
  return { original, placeholder };
}

const images = Array(15)
  .fill(null)
  .map((_, index) => {
    const { placeholder, original } = getCloudinaryImageUrl(String(index));
    if (index != 0) return { placeholder, original };
    return null;
  });

function App() {
  return (
    <div className="App">
      <h1>Image Gallery</h1>
      <div className="container">
        <Gallery />
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <div className="wrapper" id="gallery-wrapper">
      {images.map((image, index) =>
        image ? (
          <div key={index} className="image-container">
            <Image src={image.original} placeholderSrc={image.placeholder} />
          </div>
        ) : null
      )}
    </div>
  );
}

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholderSrc: string;
};

/**
 * Object controlling Intersection Observer
 *
 * @param root - element used as the viewport for checking visibility of target,
 * defaults to browser viewport if not specified.
 * @param rootMargin - Margin around the root.
 * @param threshhold - At what percentage of target visiblity the callback is invoked
 */
const options = {
  root: null,
  rootMargin: "0px",
  treshhold: 1,
};

function Image({ src, placeholderSrc }: ImageProps) {
  const intersectingRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target as HTMLImageElement;
        //check if lazyImg dataset is available
        if (lazyImage.dataset.src) {
          lazyImage.src = lazyImage.dataset.src;
          //image should be loaded by this time, unobserve already loaded images
          observerRef.current?.unobserve(entry.target);
        }
      }
    }, options);
  }, []);

  useEffect(() => {
    const elementToObserve = intersectingRef.current;

    if (elementToObserve && observerRef.current) {
      return observerRef.current.observe(elementToObserve);
    }

    return function cleanup() {
      if (observerRef.current) {
        return observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <img
      src={placeholderSrc}
      data-src={src}
      ref={intersectingRef}
      className="image"
    />
  );
}

export default App;
