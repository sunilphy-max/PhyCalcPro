"use client";

import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import {
  BEARING_MANUFACTURER_LABELS,
  BEARING_TYPE_LABELS,
  type BearingCatalogEntry,
} from "@/data/catalogs/bearingCatalog";

type Props = {
  result: BearingResult;
  loadUnit: string;
  catalogEntry?: BearingCatalogEntry;
};

function utilizationStatus(value: number, limit: number, higherIsSafe: boolean): "safe" | "danger" {
  return higherIsSafe ? (value >= limit ? "safe" : "danger") : value <= limit ? "safe" : "danger";
}

/** Registers all bearing metrics into the unified results table (cards render nothing). */
export default function BearingResultsMetrics({ result, loadUnit, catalogEntry }: Props) {
  return (
    <>
      <CalculatorMetricGrid cols={4} section="SKF / ISO 281 life">
        <CalculatorMetricCard label="Catalog designation" value={result.designation ?? "—"} tone="blue" />
        <CalculatorMetricCard label="Bearing family" value={BEARING_TYPE_LABELS[result.bearingType]} />
        <CalculatorMetricCard
          label="Life method"
          value={
            result.lifeMethod === "iso16281_screen"
              ? "ISO 16281 screen"
              : result.lifeMethod === "stress_life_screen"
                ? "Stress-life screen"
                : "ISO 281 / aSKF"
          }
        />
        <CalculatorMetricCard
          label="Equivalent load P"
          numericValue={fromBase(result.equivalentLoad, "force", loadUnit)}
          unit={loadUnit}
          tone="orange"
        />
        <CalculatorMetricCard
          label={`Basic L10 (a1=${result.a1})`}
          numericValue={result.expectedLife}
          unit="h"
          tone="blue"
        />
        <CalculatorMetricCard
          label="Modified rating life Lnm"
          numericValue={result.modifiedLife}
          unit="h"
          tone="purple"
          size="lg"
        />
        <CalculatorMetricCard
          label="Life factor (effective)"
          numericValue={result.aIso}
          unit="—"
          tone="blue"
        />
        {result.misalignmentUsedMrad != null && result.misalignmentUsedMrad > 0 ? (
          <CalculatorMetricCard
            label="Misalignment used"
            numericValue={result.misalignmentUsedMrad}
            unit="mrad"
          />
        ) : null}
        {result.advancedLifeFactors && result.advancedLifeFactors.aStress !== 1 ? (
          <CalculatorMetricCard
            label="a_stress (not GBLM)"
            numericValue={result.advancedLifeFactors.aStress}
            unit="—"
          />
        ) : null}
        {result.advancedLifeFactors && result.advancedLifeFactors.hybridLifeFactor !== 1 ? (
          <CalculatorMetricCard
            label="Hybrid life factor"
            numericValue={result.advancedLifeFactors.hybridLifeFactor}
            unit="—"
          />
        ) : null}
        {result.adjustedReferenceSpeed && result.adjustedReferenceSpeed.nAdjRpm > 0 ? (
          <CalculatorMetricCard
            label="n_θ / n (adjusted)"
            numericValue={result.adjustedReferenceSpeed.nAdjMargin}
            unit="—"
            status={result.adjustedReferenceSpeed.nAdjMargin >= 1 ? "safe" : "warning"}
          />
        ) : null}
        {result.energyCo2 ? (
          <CalculatorMetricCard
            label="Annual CO₂ (friction)"
            numericValue={result.energyCo2.annualCo2Kg}
            unit="kg"
          />
        ) : null}
        {result.referenceSpeedMargin != null ? (
          <CalculatorMetricCard
            label="Ref. speed margin n_ref/n"
            numericValue={result.referenceSpeedMargin}
            unit="—"
            status={result.referenceSpeedMargin >= 1 ? "safe" : "warning"}
          />
        ) : null}
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={4} section="Safety checks">
        <CalculatorMetricCard
          label="P / C"
          numericValue={result.dynamicUtilization}
          unit="—"
          status={utilizationStatus(result.dynamicUtilization, 1, false)}
        />
        <CalculatorMetricCard
          label="Static s₀"
          numericValue={result.staticSafetyFactor}
          unit="—"
          status={utilizationStatus(result.staticSafetyFactor, 1, true)}
        />
        <CalculatorMetricCard
          label="Speed margin n_lim/n"
          value={result.speedMargin != null ? result.speedMargin.toFixed(2) : "N/A"}
          status={result.speedMargin == null || result.speedMargin >= 1 ? "safe" : "danger"}
        />
        <CalculatorMetricCard
          label="Life util. L_req/Lnm"
          numericValue={result.lifeUtilization}
          unit="—"
          status={utilizationStatus(result.lifeUtilization, 1, false)}
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={4} section="Lubrication factors">
        <CalculatorMetricCard label="κ (viscosity ratio)" numericValue={result.modifiedLifeFactors.kappa} unit="—" />
        <CalculatorMetricCard label="Contamination eC" numericValue={result.modifiedLifeFactors.eC} />
        <CalculatorMetricCard label="Pu / P" numericValue={result.modifiedLifeFactors.puOverP} />
        <CalculatorMetricCard
          label="Min. radial load"
          numericValue={fromBase(result.minimumRadialLoadN, "force", loadUnit)}
          unit={loadUnit}
          status={result.minLoadSatisfied ? "safe" : "danger"}
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={4} section="Operating">
        <CalculatorMetricCard label="Friction torque" numericValue={result.frictionTorqueNm} unit="N·m" />
        <CalculatorMetricCard label="Power loss" numericValue={result.powerLossW} unit="W" />
        <CalculatorMetricCard
          label="Temp. derating C"
          numericValue={Number(result.temperatureDeratingFactor * 100)}
          unit="%"
        />
        <CalculatorMetricCard
          label="Required dynamic C"
          numericValue={fromBase(result.requiredDynamicRating, "force", loadUnit)}
          unit={loadUnit}
          tone="amber"
        />
      </CalculatorMetricGrid>

      {result.fitRecommendation ? (
        <CalculatorMetricGrid cols={3} section="Fits">
          <CalculatorMetricCard label="Shaft fit" value={result.fitRecommendation.shaftFit} tone="blue" />
          <CalculatorMetricCard label="Housing fit" value={result.fitRecommendation.housingFit} tone="blue" />
          <CalculatorMetricCard
            label="Est. clearance"
            numericValue={Number(result.fitRecommendation.estimatedOperatingClearanceUm.toFixed(0))}
            unit="µm"
          />
        </CalculatorMetricGrid>
      ) : null}

      {result.geometry ? (
        <CalculatorMetricGrid cols={2} section="Catalog">
          <CalculatorMetricCard
            label="Geometry"
            value={`d=${result.geometry.boreMm} D=${result.geometry.outerDiameterMm} B=${result.geometry.widthMm} mm`}
          />
          <CalculatorMetricCard
            label="Ratings C / C₀"
            value={`${formatDisplayNumber(fromBase(result.dynamicLoadRatingN, "force", loadUnit))} / ${formatDisplayNumber(fromBase(result.staticLoadRatingN, "force", loadUnit))} ${loadUnit}`}
          />
          {result.modifiedLifeFactors?.fatigueLoadLimitN != null ? (
            <CalculatorMetricCard
              label={
                catalogEntry?.fatigueLoadLimitFromDatasheet
                  ? "Fatigue limit Pu (datasheet)"
                  : "Fatigue limit Pu (est.)"
              }
              value={`${formatDisplayNumber(fromBase(result.modifiedLifeFactors.fatigueLoadLimitN, "force", loadUnit))} ${loadUnit}`}
            />
          ) : null}
          <CalculatorMetricCard
            label="Manufacturer"
            value={catalogEntry ? BEARING_MANUFACTURER_LABELS[catalogEntry.manufacturer] : "—"}
          />
          {catalogEntry?.unitSystem === "inch" && catalogEntry.boreIn != null ? (
            <CalculatorMetricCard
              label="Inch size"
              value={`${catalogEntry.boreIn.toFixed(3)} × ${catalogEntry.outerDiameterIn?.toFixed(3)} × ${catalogEntry.widthIn?.toFixed(3)} in`}
            />
          ) : null}
          {result.limitingSpeedRpm != null ? (
            <CalculatorMetricCard
              label="Limiting speed"
              value={formatEngineeringValue(result.limitingSpeedRpm, "RPM", { digits: 0 })}
            />
          ) : null}
        </CalculatorMetricGrid>
      ) : null}
    </>
  );
}
