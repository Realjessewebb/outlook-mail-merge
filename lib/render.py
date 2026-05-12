from jinja2 import Environment

_env = Environment()

def render(template_str: str, row: dict) -> str:
    return _env.from_string(template_str).render(**row)
