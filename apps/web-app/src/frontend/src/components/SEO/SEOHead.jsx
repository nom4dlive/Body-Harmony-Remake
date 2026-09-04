import { Helmet } from 'react-helmet-async'
import { useData } from '../../context/DataContext'

export default function SEOHead({ title, description, keywords, image }) {
  const { siteConfig } = useData()

  // Fallbacks from siteConfig or hardcoded
  const defaultTitle = 'Body Harmony - Remodelação Corporal'
  const defaultDesc = siteConfig?.seo?.description || 'Transforme sua carreira com o método Body Harmony. Cursos e mentorias para esteticistas e profissionais da saúde.'
  const defaultKeywords = siteConfig?.seo?.keywords || 'estética, remodelação corporal, curso estética, body harmony'
  
  const pageTitle = title 
    ? `${title} | ${siteConfig?.seo?.titleSuffix || 'Body Harmony'}`
    : (siteConfig?.seo?.defaultTitle || defaultTitle)

  const metaDesc = description || defaultDesc
  const metaKeywords = keywords || defaultKeywords
  const metaImage = image || '/og-image.jpg' // Assuming an OG image exists or will exist

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={metaKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={metaDesc} />
      <meta property="twitter:image" content={metaImage} />
    </Helmet>
  )
}
