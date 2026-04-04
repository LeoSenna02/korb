import Image from "next/image";

interface BrandLogoProps {
  size?: number;
  showName?: boolean;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  nameClassName?: string;
}

const LOGO_SRC = "/assets/images/korb-logo-square.png";

export function BrandLogo({
  size = 40,
  showName = true,
  priority = false,
  className,
  imageClassName,
  nameClassName,
}: BrandLogoProps) {
  const wrapperClassName = [
    "flex items-center",
    showName ? "gap-3" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const imageWrapperClassName = [
    "relative shrink-0 overflow-hidden rounded-2xl",
    imageClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const brandNameClassName = [
    "font-display text-lg font-semibold text-primary",
    nameClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      <div
        className={imageWrapperClassName}
        style={{ width: size, height: size }}
      >
        <Image
          src={LOGO_SRC}
          alt="Korb"
          fill
          priority={priority}
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>

      {showName ? <span className={brandNameClassName}>Korb</span> : null}
    </div>
  );
}
