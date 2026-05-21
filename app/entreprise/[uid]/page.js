import EntrepriseClient from './EntrepriseClient'

export default function EntreprisePage({ params }) {
  return <EntrepriseClient uid={params.uid} />
}
