export interface CustomHTMLElement extends HTMLElement {
  _resolver?: ((value: any) => void)[];
}
