"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import HeatExchangerInputs from "@/components/pressure/heat-exchangers/HeatExchangerInputs";
import HeatExchangerResults from "@/components/pressure/heat-exchangers/HeatExchangerResults";
import { solveHeatExchangerEngine } from "@/lib/pressure/heat-exchangers/engine";
import type { HeatExchangerResult, HeatExchangerFlowType } from "@/lib/pressure/heat-exchangers/types";

export default function Page() {
  const [hotFlowRate, setHotFlowRate] = useState(1.2);
  const [coldFlowRate, setColdFlowRate] = useState(1.5);
  const [hotCp, setHotCp] = useState(4180);
  const [coldCp, setColdCp] = useState(4180);
  const [hotInletTemp, setHotInletTemp] = useState(150);
  const [coldInletTemp, setColdInletTemp] = useState(25);
  const [hotOutletTemp, setHotOutletTemp] = useState(80);
  const [U, setU] = useState(500);
  const [area, setArea] = useState(30);
  const [flowType, setFlowType] = useState<HeatExchangerFlowType>("counterflow");
  const [result, setResult] = useState<HeatExchangerResult | null>(null);

  const calculate = () => {
    setResult(
      solveHeatExchangerEngine({
        hotFlowRate,
        coldFlowRate,
        hotCp,
        coldCp,
        hotInletTemp,
        coldInletTemp,
        hotOutletTemp,
        U,
        area,
        flowType,
      })
    );
  };

  return (
    <DashboardLayout title="Heat Exchangers">
      <CalculatorLayout
        title="Heat Exchanger Sizing"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Heat exchanger guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Provide inlet temperatures, flow rates, and exchanger area to estimate thermal duty and effectiveness.
              </p>
            </div>
          </div>
        }
        center={
          <HeatExchangerInputs
            hotFlowRate={hotFlowRate}
            setHotFlowRate={setHotFlowRate}
            coldFlowRate={coldFlowRate}
            setColdFlowRate={setColdFlowRate}
            hotCp={hotCp}
            setHotCp={setHotCp}
            coldCp={coldCp}
            setColdCp={setColdCp}
            hotInletTemp={hotInletTemp}
            setHotInletTemp={setHotInletTemp}
            coldInletTemp={coldInletTemp}
            setColdInletTemp={setColdInletTemp}
            hotOutletTemp={hotOutletTemp}
            setHotOutletTemp={setHotOutletTemp}
            U={U}
            setU={setU}
            area={area}
            setArea={setArea}
            flowType={flowType}
            setFlowType={setFlowType}
            onCalculate={calculate}
          />
        }
        right={<HeatExchangerResults result={result} />}
      />
    </DashboardLayout>
  );
}
