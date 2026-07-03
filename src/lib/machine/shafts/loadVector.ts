/**
 * Shaft Load Vector Assembly
 */

import type { BearingReaction, BearingSupport, LoadCase } from "./types";
import type { ShaftFEMModel } from "./femTypes";
import { findNearestNodeIndex } from "./mesh";

export type LoadVectorResult = {
  F: number[];
  appliedLoads: LoadCase[];
};

function uniformTransverseElementLoad(w0: number, L: number, startDof: number, F: number[]) {
  F[startDof + 1] += (w0 * L) / 2;
  F[startDof + 4] += (w0 * L * L) / 12;
  F[startDof + 7] += (w0 * L) / 2;
  F[startDof + 10] += -(w0 * L * L) / 12;
}

export function createLoadVector(
  model: ShaftFEMModel,
  loads: LoadCase[],
  includeSelfWeight: boolean,
  density: number,
  gravity = 9.81
): LoadVectorResult {
  const nNodes = model.nodes.length;
  const nDOF = nNodes * 6;
  const F: number[] = Array(nDOF).fill(0);

  for (const load of loads) {
    const nodeIndex = findNearestNodeIndex(model.nodes, load.position);
    const nodeDOF = nodeIndex * 6;

    if (load.torque) {
      F[nodeDOF + 3] += load.torque;
    }
    if (load.bendingMoment) {
      F[nodeDOF + 4] += load.bendingMoment;
    }
    if (load.axialForce) {
      F[nodeDOF + 0] += load.axialForce;
    }
    if (load.transverseForce) {
      F[nodeDOF + 1] += load.transverseForce;
    }
  }

  if (includeSelfWeight) {
    for (const element of model.elements) {
      const w0 = density * element.area * gravity;
      const startDof = element.startNode * 6;
      uniformTransverseElementLoad(w0, element.length, startDof, F);
    }
  }

  return { F, appliedLoads: loads };
}

export function applySupportConstraints(
  model: ShaftFEMModel,
  supports: BearingSupport[]
): { dof: number; value: number }[] {
  const constraints: { dof: number; value: number }[] = [];
  const constrainedDofs = new Set<number>();

  const add = (dof: number) => {
    if (!constrainedDofs.has(dof)) {
      constrainedDofs.add(dof);
      constraints.push({ dof, value: 0 });
    }
  };

  supports.forEach((support, index) => {
    const nodeIndex = findNearestNodeIndex(model.nodes, support.position);
    const base = nodeIndex * 6;

    if (support.type === "fixed") {
      for (let i = 0; i < 6; i++) {
        add(base + i);
      }
    } else {
      add(base + 1);
      add(base + 2);
      if (index === 0) {
        add(base + 0);
        add(base + 3);
      }
    }
  });

  return constraints;
}

export function defaultSupports(): BearingSupport[] {
  return [{ position: 0, type: "fixed" }];
}

export function simplySupportedSupports(length: number): BearingSupport[] {
  return [
    { position: 0, type: "pin" },
    { position: length, type: "pin" },
  ];
}

export function applyConstraints(
  nNodes: number,
  supportType: "fixed" | "pinned" | "free"
): { dof: number; value: number }[] {
  const constraints: { dof: number; value: number }[] = [];

  if (supportType === "fixed") {
    for (let i = 0; i < 6; i++) {
      constraints.push({ dof: i, value: 0 });
    }
  } else if (supportType === "pinned") {
    for (let i = 0; i < 3; i++) {
      constraints.push({ dof: i, value: 0 });
    }
  }

  return constraints;
}

export function extractBearingReactions(
  K: number[][],
  F: number[],
  displacements: number[],
  model: ShaftFEMModel,
  supports: BearingSupport[]
): BearingReaction[] {
  const reactions: BearingReaction[] = [];

  for (const support of supports) {
    const nodeIndex = findNearestNodeIndex(model.nodes, support.position);
    const base = nodeIndex * 6;
    let fy = 0;
    let fz = 0;
    let my = 0;
    let mz = 0;

    for (let j = 0; j < displacements.length; j++) {
      fy += K[base + 1]![j]! * displacements[j]! - F[base + 1]!;
      fz += K[base + 2]![j]! * displacements[j]! - F[base + 2]!;
      my += K[base + 4]![j]! * displacements[j]! - F[base + 4]!;
      mz += K[base + 5]![j]! * displacements[j]! - F[base + 5]!;
    }

    reactions.push({
      position: model.nodes[nodeIndex]!.x,
      forceY: -fy,
      forceZ: -fz,
      momentY: -my,
      momentZ: -mz,
    });
  }

  return reactions;
}
