# Adding a new node type

1. Add to `FlowNodeType` enum in `schema.prisma`
2. Create `MyNode.tsx`, `getNodeTypeMyRole.ts` and `roleSchema.ts` in `components/nodes` folder.
3. Add to `utils/nodeTypes.ts`
4. Add to [CreateOrUpdateNodeModal.tsx](../components/CreateOrUpdateNodeModal.tsx)
5. Add to `onCreate` in [Flow.tsx](../components/Flow.tsx)
6. Add to `nodesSchema` and `prisma.flowNode.createMany` in [updateFlow.ts](../actions/updateFlow.ts)
7. Add to `switch` in [getInitialNodesAndEdges.ts](../utils/getInitialNodesAndEdges.ts)
