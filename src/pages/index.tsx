import { GetStaticProps } from 'next';
import { api } from '../services/api';

import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { parseISO } from 'date-fns';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

type Episode = {
  id: string;
  title: string;
  members: string;
  description: string;
  duration: number;
  durationAsString: string;
  publishedAt: string;
  url: string;


}

type HomeProps = {
  episodes: Episode[];
}

export default function Home(props : HomeProps) {

  return (
   <p>{JSON.stringify(props.episodes)}</p>
  )
}

// SSR - getServerSideProps()
// SSG - getStaticProps()

export const getStaticProps : GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      tile: episode.title,
      description: episode.description,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url
    }
  })

  return {
    props:  {
      episodes: episodes
    }, 
    revalidate: 60 * 60 * 8,
  }

}
