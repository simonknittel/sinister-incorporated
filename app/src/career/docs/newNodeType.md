# Adding a new node type

1. Create `MyNode.tsx` in `components` folder.
2. Add to `utils/nodeTypes.ts`
3. Add to `components/CreateNodeModal.tsx`
4. Add to `schema` and `onCreate` in `components/Flow.tsx`
5. Add to `nodesSchema` and `prisma.flowNode.createMany` in `actions/updateFlow.ts`
6. Add to `switch` in `utils/getInitialNodesAndEdges.ts`
