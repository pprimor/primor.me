type OptimizedImageProps = {
  /** Path without extension, e.g. "/images/website-light" */
  basePath: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
};

export default function OptimizedImage({
  basePath,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  fetchPriority,
}: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={`${basePath}.avif`} type="image/avif" />
      <source srcSet={`${basePath}.webp`} type="image/webp" />
      <img
        src={`${basePath}.png`}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}
