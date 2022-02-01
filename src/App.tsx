import useNativeLazyLoading from "@charlietango/use-native-lazy-loading";
import { useCallback, useRef, useState } from "react";
import "./App.css";

function getCloudinaryImageUrl(id: string) {
  return `https://res.cloudinary.com/chimson/image/upload/f_webp,q_70,w_400,h_600/v1643655382/intersection-observer-demo/image_${id}.jpg`;
}

const images = Array(15)
  .fill(null)
  .map((_, index) => {
    const url = getCloudinaryImageUrl(String(index));
    if (index != 0) return url;
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
            <Image src={image} width="400px" height="600px" />
          </div>
        ) : null
      )}
    </div>
  );
}

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

function Image({ src, width, height }: ImageProps) {
  /**
   * Detects support for native loading.
   * https://caniuse.com/loading-lazy-attr
   */
  const supportsNativeLoading = useNativeLazyLoading();

  const [inView, setInView] = useState(false);

  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  const intersectingRef = useCallback(
    (node) => {
      // dont observe at all if lazy loading is natively supported
      if (supportsNativeLoading) return;

      if (node && !inView) {
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
          rootMargin: "600px 0px",
          treshhold: 0,
        };

        observerRef.current = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            //image should be loaded by this time, unobserve already loaded nodes
            observerRef.current?.unobserve(entry.target);
          }
        }, options);

        if (observerRef.current) {
          observerRef.current.observe(node);
        }

        if (inView) {
          observerRef.current.disconnect();
        }
      }
    },
    [supportsNativeLoading]
  );

  return (
    <div ref={intersectingRef}>
      {inView || supportsNativeLoading ? (
        <img
          alt=""
          //native lazy loading attr
          loading="lazy"
          src={src}
          width={width}
          height={height}
          className="image"
        />
      ) : null}
    </div>
  );
}

export default App;
