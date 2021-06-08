import { GetStaticProps } from 'next';
import { api } from '../services/api';
import styles from './home.module.scss';
import Image from 'next/image';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { parseISO } from 'date-fns';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

type Episode = {
  id: string;
  title: string;
  members: string;
  description: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  publishedAt: string;
  url: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes} : HomeProps) {

  return (
   <div className={styles.homepage}>
     <section className={styles.latestEpisodes}>
       <h2>Últimos lançamentos</h2>
       
       <ul>
         {latestEpisodes.map(ep => {
          return (
            <li key={ep.id}>
              <Image width={192} height={192} src={ep.thumbnail} alt={ep.title} objectFit="cover"/>
              
              <div className={styles.episodeDetails}>
                <a href="">{ep.title}</a>
                <p>{ep.members}</p>
                <span>{ep.publishedAt}</span>
                <span>{ep.durationAsString}</span>
              </div>

              <button type="button">
                <img src="/play-green.svg" alt="Tocar Episódio" />
              </button>
            </li>
          ) 
          })}
       </ul>
     </section>

     <section className={styles.allEpisodes}>

     </section>
   </div>
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
      title: episode.title,
      description: episode.description,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url
    }
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props:  {
      latestEpisodes,
      allEpisodes
    }, 
    revalidate: 60 * 60 * 8,
  }

}
