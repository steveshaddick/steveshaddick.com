from django import forms


class WriteForm(forms.Form):
	subject = forms.CharField()
	text = forms.CharField(widget=forms.Textarea)