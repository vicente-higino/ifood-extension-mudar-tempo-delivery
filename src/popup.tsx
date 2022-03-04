import React, { useCallback, useEffect, useRef, useState } from "react";
import { IAreaParams } from "./AreaParamsResponse";
import getMerchant from "./get-merchant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faSave, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { hide, show, toggle } from "./content_script";
import { getCookie, getAreasParams, getAreasAttending, saveAreas, prepareData } from "./utils";

const LoadingSpinner = () => {
  return (
    <div className="load">
      <span id="spinner">
        <FontAwesomeIcon icon={faSpinner} />
      </span>
    </div>
  );
};

const Exit = () => {
  return (
    <div className="exit" onClick={toggle}>
      <FontAwesomeIcon icon={faXmark} />
    </div>
  );
};

export const Popup = () => {
  const [timeInc, setTimeInc] = useState(0);
  const [lowestTime, setLowestTime] = useState(Number.POSITIVE_INFINITY);
  const [loading, setLoading] = useState(false);
  const [tempoMin, setTempoMin] = useState<IAreaParams>();
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const loggedInRef = useRef(false);
  const updateTempoMin = async () => {
    const merchant = getMerchant();
    const token = getCookie("access_token");
    if (merchant && token) {
      setLoading(true);
      const areasParamsDefaultRes = await getAreasParams("DEFAULT", merchant.uuid, token);
      const lowest = areasParamsDefaultRes.data.find((a) => a.sequence == 1);
      setTempoMin(lowest);
      lowest?.time && setLowestTime(lowest.time);
      setLoading(false);
      return true;
    }
    return false;
  };

  const beforeLeave = useCallback((e: BeforeUnloadEvent) => {
    const msg = "Você realmente deseja sair? O progresso será perdido";
    e.returnValue = msg;
    return msg;
  }, []);

  const loggin = () => {
    loggedInRef.current = true;
    setisLoggedIn(true);
    show();
  };
  const loggout = () => {
    loggedInRef.current = false;
    setisLoggedIn(false);
    hide();
  };

  useEffect(() => {
    window.setInterval(async () => {
      const { pathname } = new URL(document.URL);
      if (["/login", "/logout"].includes(pathname) && loggedInRef.current) {
        loggout();
      } else {
        if (!loggedInRef.current) {
          if (await updateTempoMin()) loggin();
        }
      }
    }, 250);
  }, []);

  useEffect(() => {
    if (loading) {
      window.addEventListener("beforeunload", beforeLeave);
    } else {
      window.removeEventListener("beforeunload", beforeLeave);
    }
  }, [loading]);

  const save = async (timeInc: number) => {
    if (timeInc != 0) {
      const merchant = getMerchant();
      const token = getCookie("access_token");
      if (merchant && token) {
        setLoading(true);
        const [areasAttendigRes, areasParamsDefaultRes, areasParamsDigitalRes] = await Promise.all([
          getAreasAttending(merchant.uuid, token),
          getAreasParams("DEFAULT", merchant.uuid, token),
          getAreasParams("DIGITAL_CATALOG", merchant.uuid, token),
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
        saveAreas(prepareData("DEFAULT", areasAttending.default, areasParams.default, timeInc), merchant.uuid, token);
        saveAreas(
          prepareData("DIGITAL_CATALOG", areasAttending.digital, areasParams.digital, timeInc),
          merchant.uuid,
          token
        );
        setTempoMin((prev) => prev && { ...prev, time: prev?.time + timeInc });
        setLowestTime((prev) => prev + timeInc);
        setTimeInc(0);
        setLoading(false);
      }
    }
  };
  return (
    <>
      <Exit />
      {isLoggedIn ? (
        <div>
          {loading && <LoadingSpinner />}
          <h1 style={{ marginBlock: "0.3em" }}>
            {timeInc >= 0 ? "Aumentar" : "Diminuir"} tempo do delivery em {Math.abs(timeInc)} minutos
          </h1>
          {tempoMin && (
            <h4 style={{ margin: "0", marginBottom: "10px", textAlign: "center" }}>
              Tempo mais baixo: {tempoMin.time} minutos
            </h4>
          )}
          <div className="grid">
            <button disabled={loading || lowestTime + timeInc <= 0} onClick={() => setTimeInc(timeInc - 5)}>
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
      ) : (
        <div>
          <h1>Você precisa fazer login para utilizar essa extenção</h1>
        </div>
      )}
    </>
  );
};
