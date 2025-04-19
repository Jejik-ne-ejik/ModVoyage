import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { FaEnvelope, FaUserAlt, FaCog, FaLightbulb, FaRegComments } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  
  const teamMembers = [
    { 
      name: "Найданов Константин", 
      role: t('about.team.role.founder'), 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; {t('about.back_to_home')}
        </Link>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">{t('about.title')}</h1>
        <p className="text-xl text-white max-w-3xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card className="bg-black border-2 border-primary/50 minecraft-border">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">{t('about.mission.title')}</h2>
            <p className="text-white mb-4">
              {t('about.mission.text1')}
            </p>
            <p className="text-white">
              {t('about.mission.text2')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-black border-2 border-primary/50 minecraft-border">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">{t('about.offer.title')}</h2>
            <ul className="space-y-3 text-white">
              <li className="flex items-start">
                <FaCog className="text-primary mt-1 mr-2 flex-shrink-0" />
                <span>{t('about.offer.item1')}</span>
              </li>
              <li className="flex items-start">
                <FaCog className="text-primary mt-1 mr-2 flex-shrink-0" />
                <span>{t('about.offer.item2')}</span>
              </li>
              <li className="flex items-start">
                <FaCog className="text-primary mt-1 mr-2 flex-shrink-0" />
                <span>{t('about.offer.item3')}</span>
              </li>
              <li className="flex items-start">
                <FaCog className="text-primary mt-1 mr-2 flex-shrink-0" />
                <span>{t('about.offer.item4')}</span>
              </li>
              <li className="flex items-start">
                <FaCog className="text-primary mt-1 mr-2 flex-shrink-0" />
                <span>{t('about.offer.item5')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">{t('about.team.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="bg-black border-2 border-primary/50 minecraft-border overflow-hidden">
              <div className="p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <FaUserAlt className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-sm text-white/80">{member.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card className="bg-black border-2 border-primary/50 minecraft-border">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">{t('about.values.title')}</h2>
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <FaLightbulb className="text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{t('about.values.innovation.title')}</h3>
                  <p className="text-white/80">{t('about.values.innovation.text')}</p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <FaRegComments className="text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{t('about.values.community.title')}</h3>
                  <p className="text-white/80">{t('about.values.community.text')}</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-black border-2 border-primary/50 minecraft-border">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">{t('about.contact.title')}</h2>
            <p className="text-white mb-4">
              {t('about.contact.text')}
            </p>
            <div className="space-y-3">
              <a href="mailto:modvoyage_spt@mail.ru" className="flex items-center text-white hover:text-primary transition-colors">
                <FaEnvelope className="mr-2" size={20} />
                <span>{t('about.contact.email')}</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;