import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { getContrastColor } from '../utils/colorUtils'

export const DataContext = createContext(null)

const DEFAULT_DATA = {
  siteTexts: {
    heroTitle: 'Garanta resultados visíveis',
    heroSubtitle: 'para os seus clientes e revolucione sua prática profissional.',
    aboutTitle: 'O que você vai aprender',
    aboutDescription: 'Um método desenvolvido e validado através de inúmeros resultados',
    ctaTitle: 'Registre o seu interesse para a próxima turma',
    contactTitle: 'Ficou alguma dúvida? Manda um e-mail',
    footerEmail: 'contato@bodyharmony.com',
    footerCopyright: 'Body Harmony - 2025. Todos os direitos reservados.',
  },
  mentors: [
    {
      id: '1',
      name: 'Joselene A. Silva',
      nickname: 'Josi',
      role: 'Idealizadora e Especialista em Estética',
      photo: '/mentors/josi.png',
      bio: 'Natural de Assis (SP), Josi traz a visão prática de quem conhece o mercado de estética a fundo. Com graduação em Nutrição e Estética e pós-graduação na área, atua há 10 anos transformando corpos. Criadora do Body Harmony, não ensina apenas a operar a máquina, mas transfere a experiência de um método validado por inúmeros resultados reais, focado em devolver a autoestima aos pacientes.',
      instagram: '@bodyharmonyoficial',
    },
    {
      id: '3',
      name: 'Kaprice Gonçalves',
      nickname: 'Kaprice',
      role: 'Educadora Física e Fisiculturista',
      photo: '/mentors/kaprice.jpg',
      bio: 'A força da alta performance no Body Harmony vem da expertise de Kaprice. Fisiculturista e Educadora Física, ela eleva o nível do treinamento muscular oferecido pelo sistema. Possui Pós-graduação em Nutrição do Esporte e MBA em Coaching pelo IBC. É ela quem valida que o método não é um tratamento passivo, mas um treino real que leva à exaustão e exige conhecimento biomecânico.',
      instagram: '@Kaprice',
    }
  ],
  licenciadas: [],

  siteConfig: {
    showMentors: true,
    showLicentiates: true,
    showResults: true,
    showTestimonials: true,

    showContact: true,
    showNavbar: true,
    showFeatures: true,
    showModules: true,
    showVideos: true,
    topBar: {
      enabled: false,
      text: '🔥 Inscrições abertas para a próxima turma! Clique aqui.',
      link: 'https://wa.me/5518996356825',
      color: '#DA8E3A'
    },
    seo: {
      defaultTitle: 'Body Harmony - Remodelação Corporal',
      titleSuffix: 'Body Harmony',
      description: 'Transforme sua carreira com o método Body Harmony. Cursos e mentorias para esteticistas e profissionais da saúde.',
      keywords: 'estética, remodelação corporal, curso estética, body harmony'
    },
    navbar: {
      enabled: true,
      links: [
        { label: 'O Método', url: '/#metodo' },
        { label: 'Resultados', url: '/#resultados' },
        { label: 'Licenciadas', url: '/licenciadas' },
        { label: 'Mentores', url: '/mentores' },
        { label: 'Depoimentos', url: '/#depoimentos' },
        { label: 'Contato', url: '/contato' },
        { label: 'Área do Aluno', url: 'https://bodyharmony.com.br/portal-licenciada' }
      ],
      ctaText: 'Seja uma Licenciada',
      ctaLink: 'https://wa.me/5518996356825',
      secondaryCtaText: 'Conheça o Workshop',
      secondaryCtaLink: '/workshop',
      style: {
        density: 'md',
        ctaCustomColor: '#ED7E13'
      }
    },
    theme_settings: {
      presetId: 'original',
      colors: {
        primary: '#0A3E60',
        secondary: '#ED7E13',
        dark: '#052033',
        light: '#FAFAFA',
        white: '#FFFFFF',
        text: '#333333',
        highlight: '#ED7E13'
      }
    },
    home_hero: {
      headline: 'Domine o método Body Harmony: Licenciamento premium em eletroestimulação de alta performance.',
      subheadline: 'Transforme sua prática estética com o método que une ciência, tecnologia e precisão. Aprenda a ler o corpo e entregar resultados reais desde a primeira sessão.',
      ctaText: 'Quero me tornar uma licenciada',
      outlineCtaText: 'Agendar consultoria com especialistas',
      videoLink: '',
      expertImage: '',
      manifesto: 'O método Body Harmony não é sobre apenas operar equipamentos. É sobre leitura biomecânica, seleção precisa de fibras musculares e parâmetros científicos que garantem a entrega de resultados tangíveis e a fidelização do seu paciente.',
      video: {
        url: '',
        layout: 'none',
        objectFit: 'cover',
        objectPosition: 'center',
        autoplay: true,
        loop: true,
        muted: true,
        playsinline: true,
        opacity: 0.3
      },
      slides: ['https://i.imgur.com/smppv21.jpg']
    },
    home_metodo: {
      title: 'O Que é o Licenciamento Body Harmony?',
      description: 'O Licenciamento Body Harmony é um método exclusivo de eletroestimulação:<br /><br />Aqui você <strong>não aprende "protocolos genéricos"</strong>. Você aprende a <strong>pensar como especialista</strong>.',
      learnTitle: 'Você vai aprender a:',
      learningItems: [
        { text: '<strong>Ler o corpo do paciente</strong>' },
        { text: '<strong>Escolher a fibra muscular correta</strong>' },
        { text: '<strong>Definir a corrente ideal</strong>' },
        { text: '<strong>Configurar parâmetros com precisão</strong>' },
        { text: '<strong>Conduzir sessões com estratégia</strong>' }
      ],
      isTitle: 'O Body Harmony é:',
      harmonyItems: [
        { text: '<strong>Formação técnica avançada</strong>' },
        { text: '<strong>Metodologia validada em clínicas reais</strong>' },
        { text: '<strong>Posicionamento premium</strong>' },
        { text: '<strong>Diferencial competitivo imediato</strong>' },
        { text: '<strong>Suporte contínuo</strong>' }
      ],
      videoUrl: 'https://i.imgur.com/Ow9fPvW.mp4',
      ctaTitle: 'Transformação Profissional',
      ctaDescription: 'Você deixa de ser "mais uma esteticista" e passa a ser a profissional que entrega resultado.'
    },
    home_philosophy_banner: {
      title: 'NOSSA VISÃO',
      subtitle: 'TRANSFORMAR VIDAS ALÉM DO SUPERFICIAL',
      description: 'Ao me aprofundar no mundo da estética, identifiquei uma lacuna significativa: métodos que eram frequentemente padronizados, superficiais e mal aplicados.',
      quote: 'Não tratamos apenas celulite ou flacidez.<br /><strong>Tratamos a autoestima, a saúde metabólica e a confiança de cada paciente.</strong>',
      pillarsTitle: 'NOSSOS PILARES',
      pillars: [
        { icon: 'FaLightbulb', title: 'Inovação', text: 'Métodos avançados e eficazes' },
        { icon: 'FaHandHoldingHeart', title: 'Cuidado', text: 'Paciente no centro de tudo' },
        { icon: 'FaBalanceScale', title: 'Ética', text: 'Integridade profissional absoluta' },
        { icon: 'FaSpa', title: 'Bem-estar', text: 'Saúde holística além da aparência' },
        { icon: 'FaBullseye', title: 'Resultados', text: 'Compromisso com transformação real' }
      ]
    },
    home_philosophy: {
      title: 'Para Quem é o Licenciamento?',
      list1Title: 'O Licenciamento Body Harmony é para:',
      professionals: [
        'Esteticistas',
        'Fisioterapeutas',
        'Educadores físicos',
        'Profissionais da saúde estética',
        'Donos de clínicas',
        'Profissionais da saúde e estética em geral'
      ],
      list2Title: 'É para quem:',
      characteristics: [
        'Já atua na área',
        'Quer crescer de verdade',
        'Busca diferenciação real',
        'Não aceita estagnação',
        'Quer entregar mais resultado'
      ]
    },
    home_resultados: {
      title: 'TRANSFORMAÇÕES REAIS',
      subtitle: 'Resultados comprovados do método Body Harmony',
      results: [
        { src: 'https://i.imgur.com/HyUSsZi.png', alt: 'Resultado Body Harmony - Tratamento para Celulite Antes e Depois' },
        { src: 'https://i.imgur.com/QQaUSJr.png', alt: 'Resultado Body Harmony - Remodelação Glútea' },
        { src: 'https://i.imgur.com/AAyamCz.png', alt: 'Resultado Body Harmony - Definição Abdominal' },
        { src: 'https://i.imgur.com/Iig4Rmq.png', alt: 'Resultado Body Harmony - Tonificação Muscular' },
        { src: 'https://i.imgur.com/nlKsZxX.png', alt: 'Resultado Body Harmony - Redução de Flacidez' },
        { src: 'https://i.imgur.com/JE4Tb1U.png', alt: 'Resultado Body Harmony - Transformação Corporal Complete' }
      ]
    },
    home_instagram: {
      title: 'Junte-se à Nossa Comunidade',
      username: '@bodyharmonyoficial',
      instagramUrl: 'https://www.instagram.com/bodyharmonyoficial/',
      images: [
        'https://i.imgur.com/F7pqkBl.jpg',
        'https://i.imgur.com/UsvUI0V.jpg',
        'https://i.imgur.com/hnxwK6g.jpg',
        'https://i.imgur.com/awRJY6Q.jpg',
        'https://i.imgur.com/7ogKXxx.jpg',
        'https://i.imgur.com/5gQfsXa.jpg',
        'https://i.imgur.com/WNL354x.jpg',
        'https://i.imgur.com/78Ms1iL.jpg'
      ]
    },
    home_footer: {
      identityText: 'Um método desenvolvido e validado através de inúmeros resultados reais. Transformamos clínicas e pacientes através da fisiologia aplicada.',
      contactEmail: 'contato@bodyharmony.com',
      contactPhone: '(18) 99635-6825',
      instagram: '@bodyharmonyoficial',
      copyright: '© 2026 Protocolo Body Harmony. Todos os direitos reservados.'
    },
    home_trustbar: {
      items: [
        { id: '1', label: 'Certificação', value: 'MEC 180h', icon: 'Award' },
        { id: '2', label: 'Comunidade', value: '+1.500 licenciadas', icon: 'Users' },
        { id: '3', label: 'Acesso', value: 'Vitalício', icon: 'Clock' },
        { id: '4', label: 'Garantia', value: '7 Dias', icon: 'ShieldCheck' }
      ]
    },
    home_benefits: {
      headline: 'Por que o <span>Body Harmony?</span>',
      description: 'Esqueça os protocolos prontos de fábrica. Aprenda a pensar a eletroterapia.',
      cards: [
        { id: '1', title: 'Raciocínio Clínico Real', text: 'A maioria dos cursos ensina a apertar botões. Nós ensinamos você a entender a fisiologia por trás de cada estímulo.' },
        { id: '2', title: 'Resultados 5x Mais Rápidos', text: 'Potencialize seus resultados com a fundamentação científica e prática que só o Body Harmony oferece.' },
        { id: '3', title: 'Segurança Total', text: 'Entenda os parâmetros de segurança para tratar condições complexas com confiança absoluta.' },
        { id: '4', title: 'Independência da Máquina', text: 'O que gera resultado é o seu conhecimento, não a marca do equipamento que você utiliza.' }
      ],
      video: {
        url: '',
        layout: 'none',
        objectFit: 'cover',
        objectPosition: 'center',
        autoplay: true,
        loop: true,
        muted: true,
        playsinline: true
      }
    }
  },
  home_cta: {
    title: 'Pronta para Transformar sua Carreira?',
    subtitle: 'Junte-se à elite da eletroterapia agora mesmo.',
    buttonText: 'Garantir Minha Vaga',
    video: {
      url: '',
      layout: 'none',
      objectFit: 'cover',
      objectPosition: 'center',
      autoplay: true,
      loop: true,
      muted: true,
      playsinline: true,
      opacity: 0.3
    }
  },
  home_devices: {
    title: 'TECNOLOGIA',
    highlightTitle: 'NA PALMA DA MÃO',
    subtitle: 'PLATAFORMA EXCLUSIVA',
    videos: {
      tablet: {
        url: '',
        objectFit: 'cover',
        objectPosition: 'center',
        autoplay: true,
        loop: true,
        muted: true,
        playsinline: true
      },
      mobile: {
        url: '',
        objectFit: 'cover',
        objectPosition: 'center',
        autoplay: true,
        loop: true,
        muted: true,
        playsinline: true
      }
    }
  },
  home_social: {
    sectionTitle: 'O Que Dizem Nossas Licenciadas'
  },
  home_founder: {
    name: 'Joselene Silva (Josi)',
    bio: '<p>A trajetória do Protocolo Body Harmony começa com uma história de transformação pessoal que poucos conhecem: a fundadora Josi saiu da <strong>obesidade para se tornar campeã brasileira de fisiculturismo em apenas 5 meses</strong>.</p><p>Essa jornada intensa não foi apenas sobre estética, mas sobre compreender profundamente os <strong>parâmetros fisiológicos específicos</strong> que realmente fazem um corpo se transformar. Cada protocolo desenvolvido hoje é resultado de anos de experiência prática com diferentes tipos de corpos, comprovando que <strong>cada paciente é único e cada protocolo deve ser personalizado</strong>.</p><p>O Body Harmony não é apenas um método: é a materialização de uma vivência real de superação, validada cientificamente e respaldada juridicamente com <strong>patente registrada</strong>.</p>',
    photo: '',
    credentials: [
      'Campeã Brasileira de Fisiculturismo',
      'Criadora do Protocolo Body Harmony (Patenteado)',
      'Especialista em Eletroestimulação de Alta Performance',
      'Mais de 1.500 Licenciadas (Brasil e Uruguai)'
    ]
  },
  home_course_cta: {
    title: 'Quer aprender o Protocolo?',
    subtitle: 'As datas dos nossos cursos presenciais são divulgadas exclusivamente para interessados. Entre em contato para saber sobre a próxima turma.',
    buttonText: 'Falar no WhatsApp',
    whatsappNumber: '',
    style: {
      backgroundColor: '#081B2B',
      textColor: '#FFFFFF',
      backgroundImage: ''
    }
  },
  home_video_gallery: {
    title: 'A Experiência Body Harmony',
    subtitle: 'Confira os destaques da nossa jornada, eventos e resultados.',
    videos: [
      { title: 'Protocolo Body Harmony', url: 'https://imgur.com/zYigNLn', description: 'Descubra a ciência por trás do nosso método exclusivo.' },
      { title: 'Experiência Licenciada', url: 'https://imgur.com/tb1CZYE', description: 'Depoimentos reais de quem transformou sua carreira.' },
      { title: 'Método Body Harmony', url: 'https://imgur.com/zYigNLn', description: 'Entenda a ciência por trás do nosso método.' },
      { title: 'Cobertura de Evento', url: 'https://imgur.com/RloSU2O', description: 'Um pouco da nossa energia ao vivo.' },
      { title: 'Transformação Corporal', url: 'https://imgur.com/qSXufrB', description: 'Resultados que falam por si.' },
      { title: 'Bem Vinda (Marina)', url: 'https://imgur.com/FPgd4Yl', description: 'Mensagem especial.' }
    ]
  },
  home_testimonials_section: {
    title: 'O QUE DIZEM NOSSAS LICENCIADAS',
    subtitle: 'Histórias reais de quem transformou sua carreira com o Body Harmony',
    items: [
      {
        id: 1,
        name: "Adriana Leal",
        videoUrl: "https://imgur.com/nTfij7l",
        text: "Depoimento incrível de transformação e aprendizado.",
        type: "video"
      },
      {
        id: 2,
        name: "Paula Feliciano",
        videoUrl: "https://imgur.com/wg4N2Gz",
        text: "O Body Harmony mudou minha visão sobre eletroterapia.",
        type: "video"
      },
      {
        id: 4,
        name: "Ana Bica (Uruguai)",
        videoUrl: "https://imgur.com/Y57z1gM",
        text: "Levando o método Body Harmony para fronteiras internacionais.",
        type: "video"
      },
      {
        id: 6,
        name: "Transformação",
        videoUrl: "https://imgur.com/84vx7t7",
        text: "Eu não sabia que era possível alcançar esses resultados.",
        type: "video"
      }
    ]
  },
  results: [],
  testimonials: [],
  leads: [],
  faq: [
    { id: '1', question: 'Para quem é o curso?', answer: 'Para esteticistas, fisioterapeutas e profissionais da saúde que desejam revolucionar seus resultados.' },
    { id: '2', question: 'Preciso ter equipamentos caros?', answer: 'Não! O método ensina como extrair o máximo de qualquer equipamento de eletroestimulação.' }
  ],

  benefits: [
    { id: '1', title: 'Emagrecimento', icon: 'FaWeight' },
    { id: '2', title: 'Ganho de Massa Muscular', icon: 'FaDumbbell' },
    { id: '3', title: 'Diminuição da Gordura Corporal', icon: 'FaFire' },
    { id: '4', title: 'Flacidez', icon: 'FaSpa' },
    { id: '5', title: 'Tratamento de Celulites', icon: 'FaHandSparkles' },
    { id: '6', title: 'Fibromialgia', icon: 'FaHeartbeat' },
    { id: '7', title: 'Diabetes Tipo 2', icon: 'FaSyringe' },
    { id: '8', title: 'Sarcopenia', icon: 'FaBone' },
    { id: '9', title: 'Incontinência Urinária', icon: 'FaShieldAlt' },
  ],
  learningTopics: [
    { id: '1', title: 'Fundamentos da Medicina Integrativa' },
    { id: '2', title: 'Técnicas de Eletroestimulação' },
    { id: '3', title: 'Protocolos Personalizados' },
    { id: '4', title: 'Avaliação na Prática' },
    { id: '5', title: 'Metabolismo' },
    { id: '6', title: 'Suporte Médico Personalizado' },
    { id: '7', title: 'Práticas com Equipamentos' },
    { id: '8', title: 'Gestão e Marketing' },
  ],
  features: [
    { icon: 'FaLaptopMedical', title: '100% Online', text: 'Acesse de onde quiser, pelo celular ou computador.' },
    { icon: 'FaCertificate', title: 'Certificado Incluso', text: 'Certificação reconhecida para impulsionar sua carreira.' },
    { icon: 'FaUserMd', title: 'Suporte VIP', text: 'Tire dúvidas diretamente com nossa equipe de especialistas.' }
  ],
  videos: []
}

export function DataProvider({ children }) {
  const [data, setData] = useState(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [previewOverrides, setPreviewOverrides] = useState({})

  // Fetch Initial Data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('bh_auth')

        // Fetch unificado em uma única requisição HTTP cacheada no backend (Nexus V122)
        const landingData = await api.getLandingData().catch(() => ({}))

        const protectedPromises = token ? [
          api.getLeads().catch(() => [])
        ] : [
          Promise.resolve([])
        ]

        const [fetchedLeads] = await Promise.all(protectedPromises)

        const fetchedConfig = landingData.config || {}
        const fetchedLicenciadas = landingData.licenciadas || []
        const fetchedResults = landingData.results || []
        const fetchedTestimonials = landingData.testimonials || []
        const fetchedFaq = landingData.faq || []
        const fetchedMentors = landingData.mentors || []

        const { site_texts, site_benefits, course_topics, ...otherConfig } = fetchedConfig || {}

        const localTheme = localStorage.getItem('bh_site_config_theme')
        let themeOverride = {}
        if (localTheme) {
          try { themeOverride = JSON.parse(localTheme) } catch (e) { }
        }

        const mergedConfig = {
          ...DEFAULT_DATA.siteConfig,
          ...otherConfig,
          showMentors: normalizeBoolean(otherConfig.showMentors, DEFAULT_DATA.siteConfig.showMentors),
          showLicentiates: normalizeBoolean(otherConfig.showLicentiates, DEFAULT_DATA.siteConfig.showLicentiates),
          showResults: normalizeBoolean(otherConfig.showResults, DEFAULT_DATA.siteConfig.showResults),
          showTestimonials: normalizeBoolean(otherConfig.showTestimonials, DEFAULT_DATA.siteConfig.showTestimonials),
          showContact: normalizeBoolean(otherConfig.showContact, DEFAULT_DATA.siteConfig.showContact),
          showVideos: normalizeBoolean(otherConfig.showVideos, DEFAULT_DATA.siteConfig.showVideos),

          theme_settings: {
            ...DEFAULT_DATA.siteConfig.theme_settings,
            ...(otherConfig.theme_settings || {}),
            ...(themeOverride.theme_settings || {}),
            colors: {
              ...DEFAULT_DATA.siteConfig.theme_settings.colors,
              ...(otherConfig.theme_settings?.colors || {}),
              ...(themeOverride.theme_settings?.colors || {})
            }
          }
        }

        if (mergedConfig.theme_settings?.colors) {
          const colors = mergedConfig.theme_settings.colors
          if (colors.accentPurple && !colors.highlight) {
            colors.highlight = colors.accentPurple
            delete colors.accentPurple
          }
        }

        const colors = mergedConfig.theme_settings?.colors || {}
        mergedConfig.theme_settings.computed = {
          textOnPremium: getContrastColor(colors.premium || colors.dark || '#081B2B'),
          textOnDark: getContrastColor(colors.dark || '#081B2B'),
          textOnLight: getContrastColor(colors.light || '#FAFAFA'),
          textOnWhite: getContrastColor(colors.white || '#FFFFFF'),
          textOnHighlight: getContrastColor(colors.highlight || '#7B2CBF')
        }

        const mergedTexts = site_texts ? { ...DEFAULT_DATA.siteTexts, ...site_texts } : DEFAULT_DATA.siteTexts

        const finalBenefits = Array.isArray(site_benefits) && site_benefits.length > 0 ? site_benefits :
          (Array.isArray(DEFAULT_DATA.benefits) ? DEFAULT_DATA.benefits : [])

        const finalTopics = Array.isArray(course_topics) && course_topics.length > 0 ? course_topics :
          (Array.isArray(DEFAULT_DATA.learningTopics) ? DEFAULT_DATA.learningTopics : [])

        mergedConfig.site_benefits = finalBenefits
        mergedConfig.course_topics = finalTopics

        if (!mergedConfig.navbar) {
          mergedConfig.navbar = {
            logo: '/logo.svg',
            links: [
              { label: 'O Método', url: '/#metodo' },
              { label: 'Resultados', url: '/#resultados' },
              { label: 'Licenciadas', url: '/licenciadas' },
              { label: 'Mentores', url: '/mentores' },
              { label: 'Depoimentos', url: '/#depoimentos' },
              { label: 'Contato', url: '/contato' },
              { label: 'Área do Aluno', url: 'https://bodyharmony.com.br/portal-licenciada' }
            ],
            ctaText: 'SEJA UMA LICENCIADA',
            ctaLink: 'https://wa.me/5518996356825',
            secondaryCtaText: 'CONHEÇA O WORKSHOP',
            secondaryCtaLink: '/workshop',
            style: {
              background: '#051A29',
              textColor: '#FFFFFF',
              ctaCustomColor: '#ED7E13'
            },
            logoFallback: {
              enabled: false,
              color: 'white'
            }
          }
        }

        if (!mergedConfig.section_order || mergedConfig.section_order.length === 0) {
          mergedConfig.section_order = [
            { id: 'hero', visible: true, label: 'Topo (Hero)' },
            { id: 'trustbar', visible: true, label: 'Barra de Confiança' },
            { id: 'metodo', visible: true, label: 'O Método' },
            { id: 'philosophy_banner', visible: true, label: 'Visão (Banner)' },
            { id: 'resultados', visible: true, label: 'Resultados' },
            { id: 'depoimentos', visible: true, label: 'Depoimentos' },
            { id: 'philosophy', visible: true, label: 'Para Quem (Filosofia)' },
            { id: 'beneficios', visible: true, label: 'Benefícios' },
            { id: 'instagram', visible: true, label: 'Instagram (Comunidade)' }
          ]
        }

        setData(prev => ({
          ...prev,
          siteConfig: mergedConfig,
          siteTexts: mergedTexts,
          licenciadas: Array.isArray(fetchedLicenciadas) && fetchedLicenciadas.length > 0 ? fetchedLicenciadas : [],
          results: Array.isArray(fetchedResults) && fetchedResults.length > 0 ? fetchedResults : DEFAULT_DATA.results,
          testimonials: Array.isArray(fetchedTestimonials) && fetchedTestimonials.length > 0 ? fetchedTestimonials : DEFAULT_DATA.testimonials,
          leads: Array.isArray(fetchedLeads) ? fetchedLeads : DEFAULT_DATA.leads,
          faq: Array.isArray(fetchedFaq) && fetchedFaq.length > 0 ? fetchedFaq : DEFAULT_DATA.faq,
          mentors: (Array.isArray(fetchedMentors) && fetchedMentors.length > 0 ? fetchedMentors : DEFAULT_DATA.mentors).map(m => ({
            ...m,
            photo: m.photo && (m.photo.includes('joselene') || m.photo.includes('josi')) ? '/mentors/josi.png' :
                   m.photo && m.photo.includes('kaprice') ? '/mentors/kaprice.jpg' :
                   m.photo && m.photo.includes('ulisses') ? '/mentors/ulisses.png' :
                   m.photo || '/mentors/josi.png'
          })),
          benefits: finalBenefits,
          learningTopics: finalTopics,
          features: Array.isArray(fetchedConfig?.site_features) ? fetchedConfig.site_features : DEFAULT_DATA.features,
          videos: Array.isArray(fetchedConfig?.site_videos) ? fetchedConfig.site_videos : DEFAULT_DATA.videos,
        }))
      } catch (error) {
        console.error("Failed to load initial data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  // Helper to refresh specific entity
  const refreshLicenciadas = async (force = false) => {
    const fresh = await api.getLicenciadas(force)
    setData(prev => ({ ...prev, licenciadas: fresh }))
  }

  const refreshResults = async () => {
    const fresh = await api.getResults()
    setData(prev => ({ ...prev, results: fresh }))
  }

  const refreshTestimonials = async () => {
    const fresh = await api.getTestimonials()
    setData(prev => ({ ...prev, testimonials: fresh }))
  }

  const refreshLeads = async () => {
    const fresh = await api.getLeads()
    setData(prev => ({ ...prev, leads: fresh }))
  }

  const refreshFaq = async () => {
    const fresh = await api.getFaq()
    setData(prev => ({ ...prev, faq: fresh }))
  }

  // --- Actions Wrappers ---
  const addLicenciada = async (formData) => {
    try {
      await api.saveLicenciada(null, formData)
      await refreshLicenciadas(true)
      return true
    } catch (e) {
      console.error("API addLicenciada failed", e)
      throw e
    }
  }

  const updateLicenciada = async (id, formData) => {
    try {
      await api.saveLicenciada(id, formData)
      await refreshLicenciadas(true)
      return true
    } catch (e) {
      console.error("API updateLicenciada failed", e)
      throw e
    }
  }

  const updateLicenciadaJSON = async (id, data) => {
    try {
      await api.updateLicenciadaJSON(id, data);
      await refreshLicenciadas(true);
      return true;
    } catch (e) {
      console.error("API updateLicenciadaJSON failed", e);
      return false;
    }
  }

  const deleteLicenciada = async (id) => {
    try {
      await api.deleteLicenciada(id)
      await refreshLicenciadas(true)
      return true
    } catch (e) {
      console.error("API deleteLicenciada failed", e)
      return false
    }
  }

  const addResult = async (result) => {
    try {
      await api.createResult(result)
      await refreshResults()
      return true
    } catch (e) { console.error(e); return false }
  }

  const updateResult = async (id, updatedResult) => {
    try {
      await api.updateResult(id, updatedResult)
      await refreshResults()
      return true
    } catch (e) { console.error(e); return false }
  }

  const deleteResult = async (id) => {
    try {
      await api.deleteResult(id)
      await refreshResults()
      return true
    } catch (e) { console.error(e); return false }
  }

  const addTestimonial = async (testimonial) => {
    try {
      await api.createTestimonial(testimonial)
      await refreshTestimonials()
      return true
    } catch (e) { console.error(e); return false }
  }

  const updateTestimonial = async (id, updatedTestimonial) => {
    try {
      await api.updateTestimonial(id, updatedTestimonial)
      await refreshTestimonials()
      return true
    } catch (e) { console.error(e); return false }
  }

  const deleteTestimonial = async (id) => {
    try {
      await api.deleteTestimonial(id)
      await refreshTestimonials()
      return true
    } catch (e) { console.error(e); return false }
  }

  const normalizeBoolean = (val, defaultVal) => {
    if (val === undefined || val === null) return defaultVal;
    if (val === true || val === 'true' || val === 1 || val === '1') return true;
    if (val === false || val === 'false' || val === 0 || val === '0') return false;
    return defaultVal;
  }

  const updateConfig = async (keyOrObj, value, bulkData = null) => {
    if (bulkData || (typeof keyOrObj === 'object' && keyOrObj !== null)) {
      const settingsToSave = bulkData || keyOrObj;
      setData(prev => ({
        ...prev,
        siteConfig: { ...prev.siteConfig, ...settingsToSave },
        siteTexts: settingsToSave.site_texts ? { ...prev.siteTexts, ...settingsToSave.site_texts } : prev.siteTexts
      }));
      try {
        await api.updateConfigBulk(settingsToSave);
      } catch (e) {
        console.warn("API Bulk Save failed", e);
      }
      return;
    }

    const key = keyOrObj;
    setData(prev => ({
      ...prev,
      siteConfig: { ...prev.siteConfig, [key]: value }
    }))

    if (key === 'theme_settings') {
      localStorage.setItem('bh_site_config_theme', JSON.stringify({ theme_settings: value }))
    }

    try {
      await api.updateConfig(key, value)
    } catch (e) {
      console.warn("API Save failed", e)
    }
  }

  const enablePreview = (overrides) => {
    setPreviewOverrides(overrides)
  }

  const disablePreview = () => {
    setPreviewOverrides({})
  }

  const effectiveSiteConfig = {
    ...data.siteConfig,
    ...previewOverrides
  }

  const effectiveData = {
    ...data,
    siteConfig: effectiveSiteConfig
  }

  const updateSiteText = async (key, value) => {
    const newTexts = { ...data.siteTexts, [key]: value }
    setData(prev => ({
      ...prev,
      siteTexts: newTexts
    }))
    try {
      await api.updateConfig('site_texts', newTexts)
    } catch (e) { console.error("Failed to save site texts", e) }
  }

  const addLead = async (lead) => {
    try {
      await api.createLead(lead)
      await refreshLeads()
      return true
    } catch (e) { console.error(e); return false }
  }

  const updateLead = async (id, updatedLead) => {
    try {
      await api.updateLead(id, updatedLead)
      await refreshLeads()
      return true
    } catch (e) { console.error(e); return false }
  }

  const deleteLead = async (id) => {
    try {
      await api.deleteLead(id)
      await refreshLeads()
      return true
    } catch (e) { console.error(e); return false }
  }

  const addFaq = async (item) => {
    const tempId = Date.now().toString()
    const newItem = { ...item, id: tempId }
    setData(prev => ({ ...prev, faq: [...prev.faq, newItem] }))
    try {
      await api.createFaq(item)
      await refreshFaq()
      return true
    } catch (e) {
      console.warn("API addFaq failed", e)
      return true
    }
  }

  const updateFaq = async (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      faq: prev.faq.map(f => f.id === id ? { ...f, ...updatedItem } : f)
    }))
    try {
      await api.updateFaq(id, updatedItem)
      return true
    } catch (e) {
      console.warn("API updateFaq failed", e)
      return true
    }
  }

  const deleteFaq = async (id) => {
    setData(prev => ({
      ...prev,
      faq: prev.faq.filter(f => f.id !== id)
    }))
    try {
      await api.deleteFaq(id)
      return true
    } catch (e) {
      console.warn("API deleteFaq failed", e)
      return true
    }
  }

  const refreshMentors = async () => {
    const fresh = await api.getMentors()
    if (Array.isArray(fresh)) {
      const normalized = fresh.map(m => ({
        ...m,
        photo: m.photo && (m.photo.includes('joselene') || m.photo.includes('josi')) ? '/mentors/josi.png' :
               m.photo && m.photo.includes('kaprice') ? '/mentors/kaprice.jpg' :
               m.photo && m.photo.includes('ulisses') ? '/mentors/ulisses.png' :
               m.photo || '/mentors/josi.png'
      }))
      setData(prev => ({ ...prev, mentors: normalized }))
    }
  }

  const addMentor = async (mentor) => {
    try {
      await api.createMentor(mentor)
      await refreshMentors()
      return true
    } catch (e) { console.error(e); return false }
  }

  const updateMentor = async (id, data) => {
    try {
      await api.updateMentor(id, data)
      await refreshMentors()
      return true
    } catch (e) { console.error(e); return false }
  }

  const deleteMentor = async (id) => {
    try {
      await api.deleteMentor(id)
      await refreshMentors()
      return true
    } catch (e) { console.error(e); return false }
  }

  return (
    <DataContext.Provider value={{
      ...effectiveData,
      updateSiteText,
      updateConfig,
      refreshLicenciadas,
      addLicenciada,
      updateLicenciada,
      updateLicenciadaJSON,
      deleteLicenciada,
      addResult,
      updateResult,
      deleteResult,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      addLead,
      updateLead,
      deleteLead,
      addFaq,
      updateFaq,
      deleteFaq,
      addMentor,
      updateMentor,
      deleteMentor,
      enablePreview,
      disablePreview
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
