# Email Input

Figma source: https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=2216-1139

Registry ID: `email-input`. The complete node tree was inspected with invisible instance children enabled. The set has eight variants and no hidden descendants or prototype reactions. There are no image assets.

The field uses the site's Plus Jakarta Sans font, a 404px maximum width, 12px corners, and the Figma state colors. Default, Hover, and Focused are 58px high; populated states are 60px high. The floating label is 12px; email text is 16px. Empty placeholder text is 14px.

## Admin review

Open `/admin/components/create?template=email-input` to load the component's source and state schema into the existing creation flow. Save Draft to persist it. The trusted registry renderer provides live previews in Upload, Review, and Publish steps. Publication remains an explicit admin action.

In the admin component list, use **Preview & customize** on the Email Input card. In the popup, choose **Customization**, then any of Default, Filled, Hover, Focused, Error, Success, Disabled, or Read-only. The Code tab includes the selected state usage. Customization is enabled specifically for this registry ID.

## Behavior checks

- Select every state and verify its preview, border, background, label, and fixture value.
- Edit an email, then leave the field: a complete address shows Success; an invalid address shows Error. Empty input returns to Default.
- Disabled prevents focus and editing; Read-only permits focus, selection, and copying without edits.
- State tabs support arrow keys, Home, End, and a single tab stop.
- At mobile widths the preview stacks above the code/customization panel.
- Reset clears customization and restores Default.

The copyable React source in `src/lib/registry/email-input.json` must stay synchronized with `EmailInput.tsx` when changing this component.
