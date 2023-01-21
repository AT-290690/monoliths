export const DOCUMENTATION = {
  HTTP: {
    NAME: 'HTTP',
    get_request_many_json: `[callback, ...promises] -> responses`,
    get_request_many_text: `[callback, ...promises] -> responses`,
    get_request_single_json: `[url, callback] -> void`,
    get_request_single_text: `[url, callback] -> void`,
  },
  ARRAY: {
    from: `[data] -> array`,
    split_new_line: `[string] -> array`,
    split_spaces: `[string] -> array`,
    split: `[string, separator] -> array`,
    join: `[string, separator] -> string`,
    shuffle: `[array] -> array`,
    zeroes: `[size] -> array`,
    ones: `[size] -> array`,
    range: `[start, end, step] -> array`,
  },
  BITWISE: {
    NAME: 'BITWISE',
    make_bit: `[number] -> string`,
    and: `[number, number] -> number`,
    not: `[number] -> number`,
    or: `[number, number] -> number`,
    xor: `[number, number] -> number`,
    left_shift: `[number, number] -> number`,
    right_shift: `[number, number] -> number`,
    un_right_shift: `[number, number] -> number`,
  },
  LOGIC: {
    LOGIC: {
      NAME: 'LOGIC',
      is_string: `[uknown] -> 0|1`,
      is_number: `[uknown] -> 0|1`,
      is_not_string: `[uknown] -> 0|1`,
      is_not_number: `[uknown] -> 0|1`,
      is_not_array: `[uknown] -> 0|1`,
      is_array: `[uknown] -> 0|1`,
      is_map: `[uknown] -> 0|1`,
      is_not_map: `[uknown] -> 0|1`,
      is_true: `[uknown] -> 0|1`,
      is_false: `[uknown] -> 0|1`,
      is_equal: `[uknown] -> 0|1`,
    },
  },
  CANVAS: {
    NAME: 'CANVAS',
    quick_canvas: `[w; h; border] -> ctx`,
    clear_rect: `[ctx; x; y; width; height] -> ctx`,
    draw_image: `[
    ctx;
    image;
    sx;
    sy;
    sWidth;
    sHeight;
    dx;
    dy;
    dWidth;
    dHeight
  ] -> ctx`,
    set_fill_style: `[ctx; color] -> ctx`,
    make_filled_rect: `[ctx, x, y, w, h] -> ctx`,
    set_stroke_style: `[ctx, color] -> ctx`,
    set_line_width: `[ctx, width] -> ctx`,
    make_stroke: `[ctx] -> ctx`,
    make_path: `[ctx] -> ctx`,
    move_to: `[ctx, x, y] -> ctx`,
    line_to: `[ctx, x, y] -> ctx`,
    arc: `[ctx, x, y, radius, start angle, end angle, counter clockwise] -> ctx`,
    fill: `[ctx] -> ctx`,
    stroke: `[ctx] -> ctx`,
  },
  DOM: {
    NAME: 'DOM',
    append_child: `[parent, child] -> parent`,
    get_body: `[] -> .[document; "body"]`,
    get_parent_node: `[element] -> . [element; "parentNode"]`,
    make_fragment: `[] -> fragment`,
    get_element_by_id: `[id] -> element`,
    get_elements_by_class_name: `[tag] -> elements`,
    get_elements_by_tag_name: `[tag] -> element`,
    make_user_interface: `[] -> div`,
    make_image: `[src] -> img`,
    make_iframe: `[src] -> iframe`,
    make_element: `[type, settings] -> element`,
    make_canvas: `[settings] -> element`,
    make_input: `[settings] -> element`,
    make_textarea: `[settings] -> element`,
    make_checkbox: `[] -> checkbox`,
    make_slider: `[settings] -> element`,
    copy_from_element: `[copy element] -> copy`,
    copy_from_text: `[val] -> void`,
    make_tooltip: `[defaultLabel] -> tooltip`,
    make_table: `[] -> element`,
    make_table_row: `[] -> element`,
    make_table_data: `[] -> element`,
    make_table_header: `[] -> element`,
    make_table_caption: `[] -> element`,
    make_table_column: `[] -> element`,
    make_table_column_group: `[] -> element`,
    make_table_head: `[] -> element`,
    make_table_body: `[] -> element`,
    make_table_footer: `[] -> element`,
    make_button: `[] -> element`,
    make_progress: `[] -> element`,
    make_indeterminate_progress: `[] -> element`,
    add_text_content: `[element, label] -> element`,
    make_label: `[element] -> element`,
    make_header: `[n] -> element`,
    make_nav: `[elements] -> element`,
    article: `[elements] -> element`,
    make_list: `[] -> element`,
    make_css_link: `[href] -> element`,
    make_ordered_list: `[...lists] -> element`,
    make_unordered_list: `[...lists] -> element`,
    make_anchor: `[href] -> element`,
    make_pre: `[] -> element`,
    make_paragraph: `[] -> element`,
    make_span: `[] -> element`,
    set_id: `[element, id] -> element`,
    make_table_from: `[tableData] -> element`,
    get_id: `[element] -> attribute`,
    get_attribute: `[element, key] -> attribute`,
    set_attribute: `[element, key, value] -> element`,
    set_textcontent: `[element, content] -> element`,
    set_style: `[element, ...styles] -> element`,
    make_container: `[...elements] -> element`,
    make_div: `[...elements] -> element`,
    make_italic_text: `[] -> element`,
    make_strong_text: `[] -> element`,
    insert_into_container: `[container, ...elements] -> element`,
    remove_self_from_container: `[...elements] -> element`,
  },
  STYLE: {
    NAME: 'STYLE',
    make_style: `[...styles] -> element`,
    add_class: `[element, ...classlist] -> element`,
    no_border: `[] -> string`,
    border_radius: `[value] -> string`,
    border: `[options] -> string`,
    margin: `[options] -> string`,
    padding: `[options] -> string`,
    display: `[display] -> string`,
    units_percent: `[value] -> string`,
    units_pixel: `[value] -> string`,
    units_point: `[value] -> string`,
    background_color: `[color] -> string`,
    cursor_pointer: `[] -> string`,
    font_family: `[font] -> string`,
    fontsize: `[size] -> string`,
    display_show: `[element] -> string`,
    display_hide: `[element] -> string`,
    text_color: `[color] -> string`,
    text_align: `[align] -> string`,
    style_option: `[attr] -> option`,
  },
  EVENT: {
    NAME: 'EVENT',
    on_input_change: `[element, callback] -> element`,
    on_mouse_click: `[element, callback] ->  element`,
    on_mouse_over: `[element, callback] -> element`,
    on_key_down: `[element, callback] -> element`,
    on_key_up: `[element, callback] -> element`,
  },
  COLOR: {
    NAME: 'COLOR',
    make_rgb_color: `[r, g, b] -> string`,
    make_rgba_color: `[r, g, b, a] -> string`,
    random_color: `[] -> string`,
    random_light_color: `[] -> string`,
    rgb_to_hex: `[color] -> string`,
    invert_hex_color: `[hex] -> string`,
  },
}
