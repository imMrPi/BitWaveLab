import { cloneGraph } from "./graph.reducer";
import type { GraphSnapshot } from "./graph.types";

export interface GraphHistoryStatus {
  canUndo: boolean;
  canRedo: boolean;
  pastLength: number;
  futureLength: number;
}

function snapshotsEqual(left: GraphSnapshot, right: GraphSnapshot) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export class GraphHistory {
  private past: GraphSnapshot[] = [];
  private present: GraphSnapshot;
  private future: GraphSnapshot[] = [];

  constructor(initial: GraphSnapshot, private readonly limit = 80) {
    this.present = cloneGraph(initial);
  }

  commit(next: GraphSnapshot) {
    const snapshot = cloneGraph(next);
    if (snapshotsEqual(this.present, snapshot)) return false;
    this.past = [...this.past, this.present].slice(-Math.max(1, this.limit - 1));
    this.present = snapshot;
    this.future = [];
    return true;
  }

  undo() {
    const previous = this.past.at(-1);
    if (!previous) return undefined;
    this.past = this.past.slice(0, -1);
    this.future = [this.present, ...this.future];
    this.present = previous;
    return cloneGraph(this.present);
  }

  redo() {
    const next = this.future[0];
    if (!next) return undefined;
    this.future = this.future.slice(1);
    this.past = [...this.past, this.present].slice(-Math.max(1, this.limit - 1));
    this.present = next;
    return cloneGraph(this.present);
  }

  status(): GraphHistoryStatus {
    return {
      canUndo: this.past.length > 0,
      canRedo: this.future.length > 0,
      pastLength: this.past.length,
      futureLength: this.future.length,
    };
  }
}
