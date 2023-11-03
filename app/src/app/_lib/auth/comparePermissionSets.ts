import {
  type PermissionSet,
  type PermissionSetAttribute,
} from "./PermissionSet";

export default function comparePermissionSets(
  requiredPermissionSets: PermissionSet[],
  givenPermissionSets: PermissionSet[],
) {
  for (const requiredPermissionSet of requiredPermissionSets) {
    const givenPermissionSetsForResource = givenPermissionSets.filter(
      (givenPermissionSet) =>
        givenPermissionSet.resource === requiredPermissionSet.resource,
    );

    // Has negate operation
    if (
      givenPermissionSetsForResource.some(
        (givenPermissionSet) => givenPermissionSet.operation === "negate",
      )
    )
      return false;

    // Has manage operation
    if (
      givenPermissionSetsForResource.some(
        (givenPermissionSet) => givenPermissionSet.operation === "manage",
      )
    ) {
      if (requiredPermissionSet.operation === "negate") return false;
      return true;
    }

    // Has matching operation
    if (
      givenPermissionSetsForResource.some((givenPermissionSet) => {
        if (givenPermissionSet.operation !== requiredPermissionSet.operation)
          return false;

        if (!requiredPermissionSet.attributes) return true;

        if (!givenPermissionSet.attributes) return false;

        const result = hasMatchingAttributes(
          requiredPermissionSet.attributes,
          givenPermissionSet.attributes,
        );

        if (!result) return false;

        return true;
      })
    )
      return true;

    return false;
  }
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
