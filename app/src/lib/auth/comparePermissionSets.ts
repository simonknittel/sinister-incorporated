import {
  type PermissionSet,
  type PermissionSetAttribute,
} from "./PermissionSet";

export default function comparePermissionSets(
  requiredPermissionSet: PermissionSet,
  givenPermissionSets: PermissionSet[],
) {
  const givenPermissionSetsForResource = givenPermissionSets.filter(
    (givenPermissionSet) =>
      givenPermissionSet.resource === requiredPermissionSet.resource,
  );

  if (
    givenPermissionSetsForResource.some(
      (givenPermissionSet) => givenPermissionSet.operation === "negate",
    )
  )
    return false;

  if (
    givenPermissionSetsForResource.some((givenPermissionSet) => {
      if (requiredPermissionSet.attributes) {
        if (!givenPermissionSet.attributes) return false;

        const result = hasMatchingAttributes(
          requiredPermissionSet.attributes,
          givenPermissionSet.attributes,
        );
        if (!result) return false;
      }

      if (!requiredPermissionSet.attributes && givenPermissionSet.attributes)
        return false;

      if (
        requiredPermissionSet.operation !== givenPermissionSet.operation &&
        givenPermissionSet.operation !== "manage"
      )
        return false;

      return true;
    })
  )
    return true;

  return false;
}

function hasMatchingAttributes(
  requiredAttributes: PermissionSetAttribute[],
  givenAttributes: PermissionSetAttribute[],
) {
  for (const requiredAttribute of requiredAttributes) {
    if (typeof requiredAttribute.value === "boolean") {
      if (requiredAttribute.value === false) continue;

      const hasMatchingAttribute = givenAttributes.find(
        (givenAttribute) =>
          givenAttribute.key === requiredAttribute.key &&
          givenAttribute.value === "true",
      );

      if (hasMatchingAttribute) continue;

      return false;
    } else {
      const hasMatchingAttribute = givenAttributes.find(
        (givenAttribute) =>
          givenAttribute.key === requiredAttribute.key &&
          (givenAttribute.value === requiredAttribute.value ||
            givenAttribute.value === "*"),
      );

      if (hasMatchingAttribute) continue;

      return false;
    }
  }

  return true;
}
