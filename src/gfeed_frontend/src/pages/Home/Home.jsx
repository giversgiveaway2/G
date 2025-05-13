import MoneyMove from '../../components/MoneyMove';
import Feed from '../../components/Feed';
import './Home.scss';

function Home() {
  const moneyMoves = [
    {
      title: "Buy DASH, PLTR",
      startDate: "2025-03-12",
      endDate: "2025-03-24",
      source: "S&P Global",
      risk: "Low risk"
    },
    {
      title: "Buy BKCL.TO, USCL.TO, CNCL.TO",
      startDate: "2025-04-12",
      endDate: "2025-05-09",
      source: "S&P Global",
      risk: "Low risk"
    }
  ];

  return (
    <div className="home page">
      <section className='home__section money-move__section'>
        <div className="home__header header">
          <h2 className="home__title">Money Moves</h2>
        </div>
        <div className="home__content">
          {moneyMoves.map((move, index) => (
            <MoneyMove
              key={index}
              {...move}
            />
          ))}
        </div>
      </section>

      <section className='home__section feed__section'>
        <Feed />
      </section>
    </div>
  );
}

export default Home;