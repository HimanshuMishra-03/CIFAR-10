export const metadata = {
  title: "CIFAR-10 Classifier",
  description: "Upload an image and get a CIFAR-10 prediction",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}


