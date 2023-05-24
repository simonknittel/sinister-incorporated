import {
  type PermissionSet,
  type PermissionSetAttribute,
} from "./PermissionSet";

export default function comparePermissionSets(
  requiredPermissionSets: PermissionSet[],
  givenPermissionSets: PermissionSet[]
) {
  for (const requiredPermissionSet of requiredPermissionSets) {
    const hasMatchingPermissionSet = givenPermissionSets.find(
      (givenPermissionSet) => {
        if (givenPermissionSet.resource !== requiredPermissionSet.resource)
          return false;

        if (
          givenPermissionSet.operation !== requiredPermissionSet.operation &&
          givenPermissionSet.operation !== "manage"
        )
          return false;

        if (!requiredPermissionSet.attributes) return true;

        if (!givenPermissionSet.attributes) return false;

        const result = hasMatchingAttributes(
          requiredPermissionSet.attributes,
          givenPermissionSet.attributes
        );

        if (!result) return false;

        return true;
      }
    );

    if (!hasMatchingPermissionSet) return false;

    return true;
  }
}

function hasMatchingAttributes(
  requiredAttributes: PermissionSetAttribute[],
  givenAttributes: PermissionSetAttribute[]
) {
  for (const requiredAttribute of requiredAttributes) {
    if (typeof requiredAttribute.value === "boolean") {
      if (requiredAttribute.value === false) continue;

      const hasMatchingAttribute = givenAttributes.find(
        (givenAttribute) =>
          givenAttribute.key === requiredAttribute.key &&
          givenAttribute.value === "true"
      );

      if (hasMatchingAttribute) continue;

      return false;
    } else {
      const hasMatchingAttribute = givenAttributes.find(
        (givenAttribute) =>
          givenAttribute.key === requiredAttribute.key &&
          givenAttribute.value === requiredAttribute.value
      );

      if (hasMatchingAttribute) continue;

      return false;
    }
  }

  return true;
}
