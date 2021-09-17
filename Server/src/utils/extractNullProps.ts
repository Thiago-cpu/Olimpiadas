export function extractNullProps(obj: any): any{
    return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v != null)
          .map(([k, v]) => [k, v === Object(v) ? extractNullProps(v) : v])
      );
}
