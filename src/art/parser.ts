import {
  NodeTypes,
  type AttributeNode,
  type DirectiveNode,
  type ElementNode,
  type RootNode,
  type TemplateChildNode,
} from '@vue/compiler-core';
import { parse as parseSfc } from '@vue/compiler-sfc';

export function isArtSfc(file: string) {
  return file.endsWith('.art.vue');
}

export function isArtMarkdownFile(file: string) {
  return file.endsWith('.art.md');
}

export function parseDefaultAttributeValue(value: string | undefined) {
  if (value === undefined) {
    return true;
  }

  return value === 'true';
}

export function isElementNode(node: TemplateChildNode): node is ElementNode {
  return node.type === NodeTypes.ELEMENT;
}

export function isArtNode(node: TemplateChildNode): node is ElementNode {
  return isElementNode(node) && node.tag.toLowerCase() === 'art';
}

export function isVariantNode(node: TemplateChildNode): node is ElementNode {
  return isElementNode(node) && node.tag.toLowerCase() === 'variant';
}

export function isAttributeNode(prop: AttributeNode | DirectiveNode): prop is AttributeNode {
  return prop.type === NodeTypes.ATTRIBUTE;
}

export function isBindDirectiveNode(prop: AttributeNode | DirectiveNode): prop is DirectiveNode {
  return prop.type === NodeTypes.DIRECTIVE && prop.name === 'bind';
}

export function collectStaticStringArrayFromBindDirective(prop: DirectiveNode, rawName: string) {
  const values: string[] = [];

  const ast = prop.type === NodeTypes.DIRECTIVE ? prop.exp?.ast : undefined;

  if (
    prop.rawName === rawName &&
    prop.exp?.type === NodeTypes.SIMPLE_EXPRESSION &&
    ast !== false &&
    ast?.type === 'ArrayExpression'
  ) {
    for (const el of ast.elements) {
      if (el?.type === 'StringLiteral') {
        values.push(el.value);
      }

      if (el?.type === 'TemplateLiteral' && el.quasis.length === 1) {
        values.push(el.quasis[0].value.raw);
      }
    }
  }

  return values;
}

export function collectAttributes(node: ElementNode) {
  const props = {} as Record<string, string | boolean | undefined | string[]>;
  const components: string[] = [];
  const tests: string[] = [];

  node.props.forEach((prop) => {
    if (isBindDirectiveNode(prop)) {
      components.push(...collectStaticStringArrayFromBindDirective(prop, ':components'));
    }

    if (isBindDirectiveNode(prop)) {
      tests.push(...collectStaticStringArrayFromBindDirective(prop, ':tests'));
    }

    if (!isAttributeNode(prop)) {
      return;
    }

    const content = prop.value?.content;

    if (prop.name === 'components' && content) {
      components.push(content);
    }

    if (prop.name === 'tests' && content) {
      tests.push(content);
    }

    props[prop.name] = prop.name === 'default' ? parseDefaultAttributeValue(content) : content;
  });

  props.components = components;
  props.tests = tests;

  return props;
}

function isNameProp(prop: AttributeNode | DirectiveNode): prop is AttributeNode {
  return isAttributeNode(prop) && prop.name === 'name';
}

export function getNameAttributeValue(node: ElementNode) {
  return node.props.find(isNameProp)?.value?.content;
}

function isDefaultProp(prop: AttributeNode | DirectiveNode): prop is AttributeNode {
  return isAttributeNode(prop) && prop.name === 'default';
}

export function getDefaultAttributeValue(node: ElementNode) {
  const prop = node.props.find(isDefaultProp);

  if (!prop) {
    return false;
  }

  return parseDefaultAttributeValue(prop.value?.content);
}

export function findArtRootNode(root: RootNode) {
  return root.children.find(isArtNode);
}

export function parseArtSfc(source: string, filename: string) {
  const { descriptor } = parseSfc(source, { filename });
  const template = descriptor.template;

  if (!template?.ast) {
    throw new Error(`Missing template in ${filename}`);
  }

  const artNode = findArtRootNode(template.ast);

  if (!artNode) {
    throw new Error(`Missing <art> root in ${filename}`);
  }

  return {
    artNode,
    variantNodes: artNode.children.filter(isVariantNode),
  };
}
