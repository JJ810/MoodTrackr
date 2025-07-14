export function Footer() {
  return (
    <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground mt-auto">
      <div className="container mx-auto">
        © {new Date().getFullYear()} MoodTrackr. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
