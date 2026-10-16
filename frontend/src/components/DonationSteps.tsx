type Step = 'idle' | 'proof' | 'chain' | 'done';

const labels: Record<Step, string> = {
  idle: 'Siap',
  proof: 'Membuat proof zk-SNARK',
  chain: 'Mencatat ke blockchain',
  done: 'Selesai',
};

export function DonationSteps({ step }: { step: Step }) {
  const order: Step[] = ['proof', 'chain', 'done'];
  const activeIndex =
    step === 'idle' ? -1 : order.indexOf(step === 'done' ? 'done' : step);

  return (
    <ol className="steps" aria-label="Progres donasi">
      {order.map((item, index) => {
        const state =
          activeIndex > index
            ? 'done'
            : activeIndex === index
              ? 'active'
              : 'pending';
        return (
          <li key={item} className={`steps__item steps__item--${state}`}>
            <span className="steps__dot" aria-hidden />
            <span className="steps__label">{labels[item]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export type DonationStep = Step;
