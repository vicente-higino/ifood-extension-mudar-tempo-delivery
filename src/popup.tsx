import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { AreaAttendingResponse } from "./AreaAttendingResponse";
import { IAreaParams, Money } from "./AreaParamsResponse";
import getMerchant from "./get-merchant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faSave, faSpinner } from "@fortawesome/free-solid-svg-icons";

const getAreasAttending = async (restaurantId: string) => {
  return await axios.get<AreaAttendingResponse>(
    `https://portal-api.ifood.com.br/next-web-bff/delivery-area/attending?restaurantUUID=${restaurantId}&context=DEFAULT,DIGITAL_CATALOG`,
    {
      headers: { Accept: "application/json" },
    }
  );
};
const getAreasParams = async (ctx: "DIGITAL_CATALOG" | "DEFAULT", restaurantId: string) => {
  return await axios.get<IAreaParams[]>(
    `https://portal-api.ifood.com.br/next-web-bff/delivery-parameters?restaurantId=${restaurantId}&context=${ctx}`,
    {
      headers: { Accept: "application/json" },
    }
  );
};

const saveAreas = (data: deliverySettings, restaurantId: string) => {
  axios.post(`https://portal-api.ifood.com.br/next-web-bff/restaurants/${restaurantId}/delivery-settings`, data, {
    headers: { Accept: "application/json, text/plain, */*" },
  });
};

interface deliverySettings {
  context: "DIGITAL_CATALOG" | "DEFAULT";
  areas: string[];
  parameters: {
    sequence: number;
    range: number;
    money: Money;
    time: number;
  }[];
}

const prepareData = (
  context: "DIGITAL_CATALOG" | "DEFAULT",
  areas: string[],
  params: IAreaParams[],
  incTime: number = 0
): deliverySettings => {
  return {
    context,
    areas,
    parameters: params.map((p) => {
      return {
        sequence: p.sequence,
        range: p.sequence,
        money: p.money,
        time: p.time + incTime,
      };
    }),
  };
};
const LoadingSpinner = () => {
  return (
    <div className="load">
      <span id="spinner">
        <FontAwesomeIcon icon={faSpinner} />
      </span>
    </div>
  );
};

const Popup = () => {
  const [timeInc, setTimeInc] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tempoMin, setTempoMin] = useState<IAreaParams>();
  useEffect(() => {
    (async () => {
      const merchant = await getMerchant();
      if (merchant) {
        setLoading(true);
        const areasParamsDefaultRes = await getAreasParams("DEFAULT", merchant.uuid);
        setTempoMin(areasParamsDefaultRes.data.find((a) => a.sequence == 1));
        setLoading(false);
      }
    })();
  }, []);

  const save = async (timeInc: number) => {
    if (timeInc != 0) {
      const merchant = await getMerchant();
      if (merchant) {
        setLoading(true);
        const [areasAttendigRes, areasParamsDefaultRes, areasParamsDigitalRes] = await Promise.all([
          getAreasAttending(merchant.uuid),
          getAreasParams("DEFAULT", merchant.uuid),
          getAreasParams("DIGITAL_CATALOG", merchant.uuid),
        ]);
        const areasIds = areasAttendigRes.data.features.flatMap((f) => {
          return f.properties.isAttending ? { id: f.properties.id, setup: f.properties.setup } : [];
        });
        const areasAttendingDefault = areasIds.flatMap((f) => {
          return f.setup == "DEFAULT" ? f.id : [];
        });
        const areasAttendingDigital = areasIds.flatMap((f) => {
          return f.setup == "DIGITAL_CATALOG" ? f.id : [];
        });
        const areasAttending = {
          default: areasAttendingDefault,
          digital: areasAttendingDigital,
        };

        const areasParams = {
          default: [...areasParamsDefaultRes.data],
          digital: [...areasParamsDigitalRes.data],
        };
        saveAreas(prepareData("DEFAULT", areasAttending.default, areasParams.default, timeInc), merchant.uuid);
        saveAreas(prepareData("DIGITAL_CATALOG", areasAttending.digital, areasParams.digital, timeInc), merchant.uuid);
        setTempoMin((prev) => prev && { ...prev, time: prev?.time + timeInc });
        setTimeInc(0);
        setLoading(false);
      }
    }
  };
  return (
    <div style={{ width: "300px" }}>
      {loading && <LoadingSpinner />}
      <h1 style={{ marginBlock: "0.3em" }}>Aumentar tempo do delivery em {timeInc} minutos</h1>
      {tempoMin && (
        <h4 style={{ margin: "0", marginBottom: "10px", textAlign: "center" }}>
          Tempo mais baixo: {tempoMin.time} minutos
        </h4>
      )}
      <div className="grid">
        <button disabled={loading} onClick={() => setTimeInc(timeInc - 5)}>
          <FontAwesomeIcon icon={faMinus} />
        </button>
        <span className="time-inc">{timeInc}</span>
        <button disabled={loading} onClick={() => setTimeInc(timeInc + 5)}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <button disabled={loading || timeInc == 0} className="last-button" onClick={() => save(timeInc)}>
          <FontAwesomeIcon icon={faSave} /> SALVAR
        </button>
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
