import { Composition } from 'remotion';
import { AdLoqar } from './AdLoqar.jsx';

export const Root = () => {
  return (
    <>
      <Composition
        id="AdLoqar"
        component={AdLoqar}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          agencyName: 'Loqar',
          slogan: 'Votre voiture, quand vous en avez besoin.',
          primaryColor: '#1a1a2e',
          accentColor: '#e94560',
        }}
      />
    </>
  );
};
