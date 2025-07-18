
import Image from 'next/image';
import fs from 'fs';
import path from 'path';

export default function PhotosPage() {
  const photosDir = path.join(process.cwd(), 'public', 'photos');
  let images: string[] = [];
  try {
    images = fs.readdirSync(photosDir).filter((file) => {
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
    });
  } catch (e) {
    // Folder may be empty or missing
  }

  return (
    <main style={{ padding: '2rem' }}>
      {images.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No photos found. Please upload images to <code>public/photos</code>.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {images.map((img) => (
            <div key={img} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Image src={`/photos/${img}`} alt={img} width={2000} height={2000} style={{ objectFit: 'cover', width: '100%', height: 'auto' }} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
