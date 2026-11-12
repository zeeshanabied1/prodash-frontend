import "./App.css";

function App() {
  const wupTime = "3:30 am";
  const sdnTime = "9:30 pm";

  return (
    <>
      <section className="flex flex-row m-2.5">
        <div className="basis-1/2 flex flex-row gap-2.5">
          <div>
            W-up:{" "}
            <span className="underline underline-offset-4">{wupTime}</span>
          </div>
          <div>
            S-dn:{" "}
            <span className="underline underline-offset-4">{sdnTime}</span>
          </div>
        </div>
        <div className="basis-1/2 flex flex-row gap-2.5">
          <div>5:10:43 AM</div>
          <div>
            <button>
              <i className=""></i>
            </button>
            <button>
              <i></i>
            </button>
            <button>
              <i></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
