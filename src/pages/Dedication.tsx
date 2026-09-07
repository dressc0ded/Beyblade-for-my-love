import dedicationArt from '../assets/dedication.jpg'

export default function Dedication() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="pixel-border bg-panel p-6 text-center" style={{ borderColor: '#000' }}>
        <div className="font-pixel holo-text text-lg mb-4">IMPRESSUM</div>
        <img
          src={dedicationArt}
          alt="A collage dedicated to spinternetjunge"
          className="mx-auto pixel-border w-full max-w-sm object-cover"
          style={{ borderColor: '#000' }}
        />
        <p className="neon-green font-pixel text-[13px] leading-loose mt-8 mb-2">
          a page designed by miss launch for no other than my loving and supportive spinternetjunge.
          <br />
          <br />
          Love you always &lt;3
        </p>
      </div>
    </div>
  )
}
