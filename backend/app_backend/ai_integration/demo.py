import openai

openai.api_key = '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'

models = openai.Model.list()
for model in models['data']:
    print(model['id'])
