type Props = {
  imageUrl?: string;
  title?: string;
  className?: string;
};

export function CampaignCover({ imageUrl, title, className = '' }: Props) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title ? `Ilustrasi ${title}` : ''}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-slate-100 to-slate-200/80 ${className}`}
      aria-hidden
    />
  );
}
