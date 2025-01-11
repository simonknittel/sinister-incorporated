# Adding a new node type

1. Create `MyNode.tsx`, `getNodeTypeMyRole.ts` and `roleSchema.ts` in `components/nodes` folder.
2. Add to `utils/nodeTypes.ts`
3. Add to [CreateOrUpdateNodeModal.tsx](../components/CreateOrUpdateNodeModal.tsx)
4. Add to `onCreate` in [Flow.tsx](../components/Flow.tsx)
5. Add to `nodesSchema` and `prisma.flowNode.createMany` in [updateFlow.ts](../actions/updateFlow.ts)
6. Add to `switch` in [getInitialNodesAndEdges.ts](../utils/getInitialNodesAndEdges.ts)
7. Add to `switch` in [useNodes.ts](../utils/useNodes.ts)
