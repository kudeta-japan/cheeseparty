'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

const EVENT_TIME = new Date('2025-10-05T17:30:00+09:00').getTime();
const DEFAULT_CAPACITY = 40;
const FORM_ENDPOINT = 'https://formspree.io/f/xpwlgjrn';
const REMAINING_ENDPOINT = process.env.NEXT_PUBLIC_REMAINING_ENDPOINT;

const EVENT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'CHEESE WONDERLAND',
  startDate: '2025-10-05T17:30:00+09:00',
  endDate: '2025-10-05T20:00:00+09:00',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: 'KU-DETA',
    address: '岐阜市加納新本町3-1-1 SPAZIO B1'
  },
  image: ['https://kudeta-japan.github.io/cheeseparty/img/ogp.jpg'],
  description:
    'とろけて・食べて・遊べるチーズテーマパーク。Raclette Slider / Chicago Waterfall / Melty Dip Pot / Cheese Lab / Espuma Basque.',
  offers: {
    '@type': 'Offer',
    price: '3000',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
    url: 'https://kudeta-japan.github.io/cheeseparty/'
  },
  organizer: {
    '@type': 'Organization',
    name: 'KU-DETA',
    url: 'https://www.instagram.com/ku_deta_gifu/'
  }
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

function useCountdown(targetTime: number): Countdown {
  const calculate = () => {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
  };

  const [countdown, setCountdown] = useState<Countdown>(calculate);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(calculate());
    }, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  return countdown;
}

function useRemainingSeats(capacity: number, endpoint?: string) {
  const [remaining, setRemaining] = useState<number>(capacity);
  const [loading, setLoading] = useState<boolean>(Boolean(endpoint));

  useEffect(() => {
    let cancelled = false;

    async function fetchSeats() {
      if (!endpoint) {
        setLoading(false);
        setRemaining(capacity);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) throw new Error('failed');
        const data = await response.json();
        const value = Number(data?.remaining ?? data?.seats ?? data?.left);
        if (!Number.isFinite(value)) {
          throw new Error('invalid');
        }
        if (!cancelled) {
          setRemaining(value);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('残席の取得に失敗しました', error);
          setRemaining(capacity);
          setLoading(false);
        }
      }
    }

    fetchSeats();
    const id = endpoint ? setInterval(fetchSeats, 60000) : undefined;
    return () => {
      cancelled = true;
      if (id) clearInterval(id);
    };
  }, [capacity, endpoint]);

  return { remaining, loading };
}

export default function Page() {
  const countdown = useCountdown(EVENT_TIME);
  const { remaining, loading } = useRemainingSeats(DEFAULT_CAPACITY, REMAINING_ENDPOINT);
  const seatText = loading ? '残席を計測中…' : `残席 ${remaining}`;
  const isLowSeat = !loading && remaining <= 5;
  const seatStatusClass = isLowSeat ? 'status-value low' : 'status-value';
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const countdownCells = useMemo(
    () => [
      { label: '日', value: countdown.days },
      { label: '時間', value: countdown.hours },
      { label: '分', value: countdown.minutes },
      { label: '秒', value: countdown.seconds }
    ],
    [countdown]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.fade').forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus('sending');
    setStatusMessage('送信中…');
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });

      if (response.ok) {
        setFormStatus('success');
        setIsSuccess(true);
        setStatusMessage('');
        form.reset();
      } else {
        setFormStatus('error');
        setStatusMessage('送信に失敗しました。時間をおいて再度お試しください。');
      }
    } catch (error) {
      console.error(error);
      setFormStatus('error');
      setStatusMessage('ネットワークエラーが発生しました。');
    }
  };

  return (
    <>
      <a className="cta-sticky btn" href="#booking">
        今すぐ予約
      </a>
      <header>
        <div className="container nav">
          <div className="logo">
            <span className="logo-dot" />
            <span>CHEESE WONDERLAND</span>
          </div>
          <nav className="nav-links">
            <a href="#experience">魅力</a>
            <a href="#highlights">メニュー</a>
            <a href="#gallery">ライブ演出</a>
            <a href="#info">開催概要</a>
            <a href="#booking">予約</a>
          </nav>
          <a className="btn" href="#booking">
            予約する
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="sparkle" aria-hidden="true" />
          <div className="container hero-inner">
            <div className="hero-copy fade">
              <div className="chip">1 NIGHT ONLY</div>
              <h1>とろける非日常がひと晩だけオープン。</h1>
              <p className="hero-lead">
                「CHEESE WONDERLAND」は、岐阜・KU-DETAを丸ごと使った没入型チーズテーマパーク。香り立つラクレット、黄金のチーズ滝、目の前で仕上げるライブキッチン。五感が歓ぶアトラクションと音楽で、忘れられない一夜へご招待します。
              </p>
              <div className="status-grid">
                <article className="status-card">
                  <span className="status-title">EVENT</span>
                  <div className="status-value">10.5 SUN 17:30-20:00</div>
                  <p className="status-note">1ドリンク付 ¥3,000 / KU-DETA（岐阜市加納新本町）</p>
                </article>
                <article className="status-card">
                  <span className="status-title">REMAINING</span>
                  <div className={seatStatusClass} aria-live="polite">
                    {seatText}
                  </div>
                  <p className="status-note">定員40名・フォーム送信順で受付。残席はGoogle Apps Scriptでリアルタイム更新。</p>
                </article>
                <article className="status-card">
                  <span className="status-title">COUNTDOWN</span>
                  <div className="countdown">
                    {countdownCells.map((cell) => (
                      <div key={cell.label} className="count-cell">
                        <b>{cell.value}</b>
                        <small>{cell.label}</small>
                      </div>
                    ))}
                  </div>
                  <p className="status-note">完売前にエントリーを。</p>
                </article>
              </div>
            </div>

            <aside className="floating-ticket fade" style={{ animationDelay: '0.4s' }}>
              <div className="badge">SPECIAL NIGHT</div>
              <h2 className="ticket-title">PREMIUM PASS</h2>
              <div className="ticket-meta">
                <span>￥3,000（1ドリンク付）</span>
                <span>Dress Code：YELLOW or GOLDを身に着けて</span>
                <span>Welcome Drinkから始まる120分の没入体験</span>
              </div>
              <a className="btn" href="#booking">
                この夜に参加する
              </a>
              <p className="note">※お支払いは当日現地にて。フォトブース、限定メニューは別途キャッシュオン。</p>
            </aside>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="container">
            <h2 className="fade">CHEESE WONDERLANDの魅力</h2>
            <p className="section-lead fade">
              会場全体が巨大なチーズアトリエに変貌。シェフと演出家がタッグを組み、視覚・聴覚・味覚のすべてを満たす仕掛けを用意しました。仲間とワイワイ、おひとり様も大歓迎。思わず写真を撮りたくなる瞬間が連続します。
            </p>
            <div className="feature-grid">
              <article className="feature-card fade">
                <div className="feature-icon">01</div>
                <h3>体験型ライブキッチン</h3>
                <p>ラクレットやチーズフォンデュを目の前で仕上げ。香り・湯気・音まで楽しめる五感のステージング。</p>
              </article>
              <article className="feature-card fade">
                <div className="feature-icon">02</div>
                <h3>写真映えする没入空間</h3>
                <p>黄金のネオン、泡のカーテン、チーズラボ。どこを切り取っても映えるフォトスポットが満載です。</p>
              </article>
              <article className="feature-card fade">
                <div className="feature-icon">03</div>
                <h3>プレミアムチーズメニュー</h3>
                <p>シカゴピザ、エスプーマバスク、メルティディップなど、ここだけの創作チーズメニューが勢ぞろい。</p>
              </article>
              <article className="feature-card fade">
                <div className="feature-icon">04</div>
                <h3>DJ &amp; ライトアップ演出</h3>
                <p>夜のKU-DETAをチーズの楽園に変える音と光。BGMもライブ感を高める特別仕様でお届けします。</p>
              </article>
            </div>
          </div>
        </section>

        <section id="highlights" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="fade">食べて味わう5大アトラクション</h2>
            <p className="section-lead fade">
              香り、食感、ビジュアルが異なる5つのメインアトラクションを用意しました。お気に入りのチーズ体験を見つけてください。
            </p>
            <div className="highlight-grid">
              <article className="highlight fade">
                <img src="/img/attr_raclette.jpg" alt="ラクレットスライダー" />
                <div className="body">
                  <h3>Raclette Slider</h3>
                  <p>熱々のラクレットをとろりとかけるライブ感抜群の一品。香ばしいミニバーガーにチーズが雪崩れ落ちます。</p>
                </div>
              </article>
              <article className="highlight fade">
                <img src="/img/attr_chicago.jpg" alt="シカゴチーズウォーターフォール" />
                <div className="body">
                  <h3>Chicago Waterfall</h3>
                  <p>チーズソースが滝のように溢れ出す圧巻のシカゴピザ。カットする瞬間の歓声が止まりません。</p>
                </div>
              </article>
              <article className="highlight fade">
                <img src="/img/attr_meltydip.jpg" alt="メルティディップポット" />
                <div className="body">
                  <h3>Melty Dip Pot</h3>
                  <p>彩り野菜とパンをディップして楽しむ濃厚チーズポット。好みのトッピングで自分だけの味を完成させて。</p>
                </div>
              </article>
              <article className="highlight fade">
                <img src="/img/attr_lab.jpg" alt="チーズラボ" />
                <div className="body">
                  <h3>Cheese Lab</h3>
                  <p>試験管やフラスコを使った遊び心満載のチーズテイスティング。香りの違いを感じるガストロラボです。</p>
                </div>
              </article>
              <article className="highlight fade">
                <img src="/img/attr_espuma.jpg" alt="エスプーマバスク" />
                <div className="body">
                  <h3>Espuma Basque</h3>
                  <p>ふわふわの泡チーズを纏ったバスクチーズケーキ。口に入れた瞬間、溶けて消える新感覚デザート。</p>
                </div>
              </article>
              <article className="highlight fade">
                <img src="/img/cheese.jpg" alt="チーズの盛り合わせ" />
                <div className="body">
                  <h3>Cheese Pairing Bar</h3>
                  <p>セレクトチーズとワイン、クラフトドリンクのマリアージュ。スタッフがペアリングをアテンドします。</p>
                </div>
              </article>
            </div>

            <div className="cta-banner fade">
              <strong>Instagramハッシュタグ #cheesewonderland を付けて投稿すると限定ギフトが当たる！</strong>
              <a className="btn ghost" href="https://www.instagram.com/ku_deta_gifu/" target="_blank" rel="noopener noreferrer">
                最新情報を見る
              </a>
            </div>
          </div>
        </section>

        <section id="gallery" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="fade">ライブ演出と空間演出</h2>
            <p className="section-lead fade">
              会場の各エリアでフォトジェニックな演出が展開。チーズの香りと音楽、ライトアップがシンクロし、クライマックスのチーズ滝まで一瞬たりとも目が離せません。
            </p>
            <div className="gallery">
              <figure className="fade">
                <img src="/img/gal_raclette.jpg" alt="ラクレットのライブ演出" />
                <figcaption>ラクレットの熱気と香りが広がるメインステージ</figcaption>
              </figure>
              <figure className="fade">
                <img src="/img/gal_chicago.jpg" alt="シカゴピザの演出" />
                <figcaption>シカゴピザが滝のように溢れるシグネチャー演出</figcaption>
              </figure>
              <figure className="fade">
                <img src="/img/gal_lab.jpg" alt="チーズラボ" />
                <figcaption>フラスコを使った遊び心満載のチーズラボ</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="fade">当日の流れ</h2>
            <p className="section-lead fade">
              開場からフィナーレまでの120分は、体験が連続するエンターテインメント。初めての方でも安心して楽しめる導線です。
            </p>
            <div className="timeline">
              <div className="timeline-step fade">
                <span>17:30 ENTRANCE</span>
                <strong>受付＆ウェルカムドリンク</strong>
                <p className="muted">ドレスコードのチェック後、限定ウェルカムドリンクで乾杯。フォトブースでの撮影もこのタイミングで。</p>
              </div>
              <div className="timeline-step fade">
                <span>18:00 MAIN SHOW</span>
                <strong>ライブキッチン開演</strong>
                <p className="muted">ラクレットやチーズ滝が次々と登場。シェフがゲストを巻き込みながら目の前で仕上げます。</p>
              </div>
              <div className="timeline-step fade">
                <span>19:30 FINALE</span>
                <strong>チーズパレード＆抽選会</strong>
                <p className="muted">ゲスト全員で味わうフィナーレメニューと抽選会。最後まで心踊る仕掛けが満載です。</p>
              </div>
            </div>
          </div>
        </section>

        <section id="info" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="fade">開催概要</h2>
            <div className="info-grid">
              <div className="info-card fade">
                <h3>INFORMATION</h3>
                <p>日時：2025年10月5日（日）17:30〜20:00</p>
                <p>会場：KU-DETA（岐阜市加納新本町3-1-1 SPAZIO B1）</p>
                <p>料金：お一人様 3,000円（1ドリンク付）</p>
                <p>ドレスコード：黄色 or ゴールドのアイテムを身に着けてご来場ください。</p>
              </div>
              <div className="info-card fade">
                <h3>INCLUDED</h3>
                <ul>
                  <li>ウェルカムドリンク（アルコール／ノンアル選択可）</li>
                  <li>ライブキッチンでのチーズメニュー体験</li>
                  <li>フォトブース＆ライトアップ演出</li>
                  <li>抽選会＆スペシャルギフト</li>
                </ul>
              </div>
              <div className="info-card fade">
                <h3>ACCESS</h3>
                <p>
                  JR岐阜駅から徒歩8分。名鉄岐阜駅から徒歩5分。
                </p>
                <p>駐車場は近隣のコインパーキングをご利用ください。</p>
                <p>
                  お問い合わせ：Instagram{' '}
                  <a href="https://www.instagram.com/ku_deta_gifu/" target="_blank" rel="noopener noreferrer">
                    @ku_deta_gifu
                  </a>{' '}
                  ／ LINE{' '}
                  <a href="https://line.me/R/ti/p/@rzd2388u" target="_blank" rel="noopener noreferrer">
                    @rzd2388u
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="booking" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="fade">ご予約フォーム</h2>
            <p className="section-lead fade">
              フォーム送信後、自動返信メールをお送りします。当日受付にてお名前をお伝えください。定員に達し次第、キャンセル待ちのご案内となります。
            </p>
            <div className="booking">
              {!isSuccess && (
                <form className="fade" onSubmit={handleSubmit}>
                  <div className="form-row two">
                    <label>
                      お名前
                      <input type="text" name="name" required placeholder="例：山田 花子" autoComplete="name" />
                    </label>
                    <label>
                      ふりがな
                      <input type="text" name="kana" required placeholder="例：やまだ はなこ" />
                    </label>
                  </div>
                  <div className="form-row two">
                    <label>
                      メールアドレス
                      <input type="email" name="email" required placeholder="例：guest@example.com" autoComplete="email" />
                    </label>
                    <label>
                      電話番号
                      <input type="tel" name="tel" required placeholder="例：09012345678" autoComplete="tel" />
                    </label>
                  </div>
                  <div className="form-row two">
                    <label>
                      参加人数
                      <select name="count" required defaultValue="">
                        <option value="" disabled>
                          選択してください
                        </option>
                        <option value="1">1名</option>
                        <option value="2">2名</option>
                        <option value="3">3名</option>
                        <option value="4">4名</option>
                        <option value="5">5名</option>
                        <option value="6">6名</option>
                      </select>
                    </label>
                    <label>
                      来場予定時刻
                      <select name="time" required defaultValue="">
                        <option value="" disabled>
                          選択してください
                        </option>
                        <option value="17:30">17:30ごろ</option>
                        <option value="18:00">18:00ごろ</option>
                        <option value="18:30">18:30ごろ</option>
                        <option value="19:00">19:00ごろ</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    ご要望・アレルギーなど
                    <textarea name="message" placeholder="例：乳製品アレルギーがある方がいます 等" />
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" required />
                    <span>個人情報の取り扱いに同意します。（予約確認の目的でのみ利用します）</span>
                  </label>
                  <input type="hidden" name="_subject" value="[KU-DETA] CHEESE WONDERLAND 予約" />
                  <input type="hidden" name="event" value="CHEESE WONDERLAND 2025-10-05" />
                  <div className="form-actions">
                    <button className="btn" type="submit" disabled={formStatus === 'sending'}>
                      {formStatus === 'sending' ? '送信中…' : '送信する'}
                    </button>
                    <button className="btn ghost" type="reset">
                      リセット
                    </button>
                  </div>
                  {statusMessage && (
                    <p id="form-status" className="muted" aria-live="polite">
                      {statusMessage}
                    </p>
                  )}
                </form>
              )}
              <aside className="fade" style={{ animationDelay: '0.2s' }}>
                <div className="thank-you" style={{ display: isSuccess ? 'block' : 'none' }}>
                  送信ありがとうございます！スタッフより確認メールをお送りします。返信が届かない場合は迷惑メールをご確認ください。
                </div>
                <p className="muted">
                  フォーム送信後、数分以内に自動返信メールが届きます。届かない場合は{' '}
                  <a href="mailto:kudeta.kanou@gmail.com">kudeta.kanou@gmail.com</a> までご連絡ください。
                </p>
                <p className="muted">キャンセル・人数変更は開催前日まで受け付けています。Instagram DMまたはLINEでご連絡ください。</p>
                <p className="muted">Google Apps Scriptとスプレッドシートで残席を自動表示しています。エラー時はページを再読み込みしてください。</p>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-inner">
          <small>© 2025 KU-DETA</small>
          <div className="sns">
            <a href="https://www.instagram.com/ku_deta_gifu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              Instagram
            </a>
            <a href="mailto:kudeta.kanou@gmail.com" aria-label="Email">
              Email
            </a>
            <a href="tel:0582742212" aria-label="Tel">
              058-274-2212
            </a>
          </div>
        </div>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_JSON_LD) }}
      />
    </>
  );
}
