import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-black text-white mt-auto border-t-4 border-primary/50">
      <div className="max-w-7xl mx-auto py-6 px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-gray-300">
          &copy; {new Date().getFullYear()} ModVoyage. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
